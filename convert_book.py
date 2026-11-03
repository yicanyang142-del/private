"""Local extraction and OCR. Stdout is newline-delimited job progress JSON."""
import sys, os, json, re, zipfile, html
from pathlib import Path
from xml.etree import ElementTree as ET
sys.path.insert(0, str(Path(__file__).parent / 'python_packages'))

def emit(**values):
    print(json.dumps(values, ensure_ascii=False), flush=True)

def readable_lines(text):
    lines=text.replace('\r','').split('\n')
    blocks=[]; current=''
    for line in lines:
        line=line.strip()
        if not line:
            if current: blocks.append(current);current=''
            continue
        if current:
            current += (' ' if current[-1:].isascii() and line[:1].isascii() else '')
        current+=line
        if re.search(r'[。！？!?；;]$',line) or len(current)>600:
            blocks.append(current);current=''
    if current:blocks.append(current)
    return '\n\n'.join(blocks)

def plain_xml(data):
    root = ET.fromstring(data)
    blocks = []
    for node in root.iter():
        if node.tag.split('}')[-1] in ('p', 'h1', 'h2', 'h3', 'li', 'tr'):
            value = ''.join(node.itertext()).strip()
            if value: blocks.append(value)
    return '\n\n'.join(blocks) or ''.join(root.itertext())

def save(destination, sections, warnings, complete=False):
    result = {'sections': sections, 'warnings': warnings, 'complete': complete,
              'text': '\n\n'.join((f'〔原书第 {s["page"]} 页〕\n' if s.get('page') else '') + s['text'] for s in sections)}
    temporary = str(destination) + '.tmp'
    Path(temporary).write_text(json.dumps(result, ensure_ascii=False), encoding='utf-8')
    os.replace(temporary, destination)

def run(source, destination):
    suffix = Path(source).suffix.lower()
    sections, warnings = [], []
    if suffix == '.pdf':
        import fitz
        import numpy as np
        document = fitz.open(source)
        if document.needs_pass: raise ValueError('PDF有密码保护，请先解密后导入')
        if len(document) > 2500: raise ValueError('PDF超过2500页，请按卷拆分导入')
        engine = None
        for index, page in enumerate(document):
            text = page.get_text(sort=True).strip()
            meaningful = len(re.sub(r'\s', '', text))
            broken = text.count('\ufffd') / max(1, len(text)) > .05
            # A small running header over a large scanned image is not usable body text.
            image_area = 0
            for image in page.get_image_info():
                box = fitz.Rect(image['bbox']) & page.rect
                image_area = max(image_area, box.get_area() / max(1, page.rect.get_area()))
            method = 'text'
            if meaningful < 25 or broken or (image_area > .55 and meaningful < 200):
                if engine is None:
                    emit(status='running', message='正在加载本地中文OCR模型', current=index, total=len(document))
                    from rapidocr_onnxruntime import RapidOCR
                    engine = RapidOCR(intra_op_num_threads=2, inter_op_num_threads=2)
                scale = min(2.0, 2200 / max(page.rect.width, page.rect.height))
                pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), colorspace=fitz.csRGB, alpha=False)
                array = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, 3)
                result, _ = engine(array)
                text = '\n'.join(line[1] for line in (result or []))
                method = 'ocr'
                if not text.strip(): warnings.append(f'第{index+1}页未识别到文字（可能为空白、插图或识别失败）')
            if text.strip(): sections.append({'page': index+1, 'text': readable_lines(text), 'method': method})
            if index == 0 or (index+1) % 3 == 0 or index+1 == len(document):
                save(destination, sections, warnings)
            emit(status='running', current=index+1, total=len(document), message=f'已处理 {index+1}/{len(document)} 页', readable=bool(sections))
        document.close()
    elif suffix in ('.docx', '.epub'):
        with zipfile.ZipFile(source) as archive:
            if sum(i.file_size for i in archive.infolist()) > 180*1024*1024: raise ValueError('解压后文件过大，请拆分导入')
            if suffix == '.docx':
                body = plain_xml(archive.read('word/document.xml'))
            else:
                container = ET.fromstring(archive.read('META-INF/container.xml'))
                opf = next(n.attrib['full-path'] for n in container.iter() if n.tag.endswith('rootfile'))
                package = ET.fromstring(archive.read(opf))
                manifest = {n.attrib['id']: n.attrib['href'] for n in package.iter() if n.tag.split('}')[-1]=='item'}
                import posixpath
                from urllib.parse import unquote
                chapters = []
                for node in package.iter():
                    if node.tag.split('}')[-1] == 'itemref':
                        entry = posixpath.normpath(posixpath.join(posixpath.dirname(opf), unquote(manifest[node.attrib['idref']].split('#')[0])))
                        chapters.append(plain_xml(archive.read(entry)))
                body = '\n\n'.join(chapters)
            sections.append({'text':body,'method':'text'})
    elif suffix in ('.txt','.md'):
        data = Path(source).read_bytes()
        body = None
        for encoding in (['utf-16'] if data[:2] in (b'\xff\xfe',b'\xfe\xff') else ['utf-8-sig','gb18030']):
            try: body=data.decode(encoding); break
            except UnicodeError: pass
        if body is None: raise ValueError('无法识别文本编码，请另存为UTF-8')
        sections.append({'text':body,'method':'text'})
    elif suffix in ('.png','.jpg','.jpeg','.webp'):
        from rapidocr_onnxruntime import RapidOCR
        from PIL import Image
        import numpy as np
        with Image.open(source) as image:
            image.thumbnail((2400,2400))
            result,_ = RapidOCR(intra_op_num_threads=2, inter_op_num_threads=2)(np.array(image.convert('RGB')))
        sections.append({'text':'\n'.join(line[1] for line in (result or [])),'method':'ocr'})
    else: raise ValueError('暂不支持此格式，请使用PDF、TXT、DOCX、EPUB、Markdown或图片')
    if not any(s['text'].strip() for s in sections): raise ValueError('没有提取到正文，请检查文件内容或扫描清晰度')
    save(destination, sections, warnings, complete=True)
    emit(status='done', message='正文转换完成', readable=True, warnings=warnings)

if __name__ == '__main__':
    try: run(sys.argv[1],sys.argv[2])
    except Exception as error:
        emit(status='failed', error=str(error))
        sys.exit(1)

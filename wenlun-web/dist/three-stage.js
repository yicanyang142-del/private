const {
  useState,
  useRef,
  useEffect
} = React;
const CHAPTERS = {
  "edition": {
    "name": "桌面「文艺学／文心雕龙.txt」",
    "detail": "用户提供的无校注者TXT；缺出版社与底本信息。原有疑字保留，按篇名定位，不编页码。"
  },
  "chapters": [{
    "id": "序志",
    "title": "序志第五十",
    "text": "夫“文心”者，言为文之用心也。昔涓子《琴心》，王孙《巧心》，心哉美矣，故用之焉。古来文章，以雕缛成体，岂取驺奭之群言雕龙也。夫宇宙绵邈，黎献纷杂，拔萃出类，智术而已。岁月飘忽，性灵不居，腾声飞实，制作而已。夫人肖貌天地，禀性五才，拟耳目于日月，方声气乎风雷，其超出万物，亦已灵矣。形同草木之脆，名逾金石之坚，是以君子处世，树德建言，岂好辩哉？不得已也！\n予生七龄，乃梦彩云若锦，则攀而采之。齿在逾立，则尝夜梦执丹漆之礼器，随仲尼而南行。旦而寤，乃怡然而喜，大哉！圣人之难见哉，乃小子之垂梦欤！自生人以来，未有如夫子者也。敷赞圣旨，莫若注经，而马郑诸儒，弘之已精，就有深解，未足立家。唯文章之用，实经典枝条，五礼资之以成文，六典因之致用，君臣所以炳焕，军国所以昭明，详其本源，莫非经典。而去圣久远，文体解散，辞人爱奇，言贵浮诡，饰羽尚画，文绣鞶帨，离本弥甚，将遂讹滥。盖《周书》论辞，贵乎体要，尼父陈训，恶乎异端，辞训之奥，宜体于要。于是搦笔和墨，乃始论文。\n详观近代之论文者多矣∶至如魏文述典，陈思序书，应瑒文论，陆机《文赋》，仲治《流别》，弘范《翰林》，各照隅隙，鲜观衢路，或臧否当时之才，或铨品前修之文，或泛举雅俗之旨，或撮题篇章之意。魏典密而不周，陈书辩而无当，应论华而疏略，陆赋巧而碎乱，《流别》精而少功，《翰林》浅而寡要。又君山、公干之徒，吉甫、士龙之辈，泛议文意，往往间出，并未能振叶以寻根，观澜而索源。不述先哲之诰，无益后生之虑。\n盖《文心》之作也，本乎道，师乎圣，体乎经，酌乎纬，变乎骚：文之枢纽，亦云极矣。若乃论文叙笔，则囿别区分，原始以表末，释名以章义，选文以定篇，敷理以举统：上篇以上，纲领明矣。至于剖情析采，笼圈条贯，攡《神》、《性》，图《风》、《势》，苞《会》、《通》，阅《声》、《字》，崇替于《时序》，褒贬于《才略》，怊怅于《知音》，耿介于《程器》，长怀《序志》，以驭群篇：下篇以下，毛目显矣。位理定名，彰乎大衍之数，其为文用，四十九篇而已。\n夫铨序一文为易，弥纶群言为难，虽复轻采毛发，深极骨髓，或有曲意密源，似近而远，辞所不载，亦不可胜数矣。及其品列成文，有同乎旧谈者，非雷同也，势自不可异也；有异乎前论者，非苟异也，理自不可同也。同之与异，不屑古今，擘肌分理，唯务折衷。按辔文雅之场，环络藻绘之府，亦几乎备矣。但言不尽意，圣人所难，识在瓶管，何能矩矱。茫茫往代，既沉予闻；眇眇来世，倘尘彼观也。\n赞曰∶\n生也有涯，无涯惟智。逐物实难，凭性良易。\n傲岸泉石，咀嚼文义。文果载心，余心有寄。"
  }, {
    "id": "风骨",
    "title": "风骨第二十八",
    "text": "《诗》总六义，风冠其首，斯乃化感之本源，志气之符契也。是以怊怅述情，必始乎风；沈吟铺辞，莫先于骨。故辞之待骨，如体之树骸；情之含风，犹形之包气。结言端直，则文骨成焉；意气骏爽，则文风清焉。若丰藻克赡，风骨不飞，则振采失鲜，负声无力。是以缀虑裁篇，务盈守气，刚健既实，辉光乃新。其为文用，譬征鸟之使翼也。\n故练于骨者，析辞必精；深乎风者，述情必显。捶字坚而难移，结响凝而不滞，此风骨之力也。若瘠义肥辞，繁杂失统，则无骨之征也。思不环周，牵课乏气，则无风之验也。昔潘勖锡魏，思摹经典，群才韬笔，乃其骨髓峻也；相如赋仙，气号凌云，蔚为辞宗，乃其风力遒也。能鉴斯要，可以定文，兹术或违，无务繁采。\n故魏文称∶“文以气为主，气之清浊有体，不可力强而致。”故其论孔融，则云“体气高妙”，论徐干，则云“时有齐气”，论刘桢，则云“有逸气”。公干亦云∶“孔氏卓卓，信含异气；笔墨之性，殆不可胜。”并重气之旨也。夫翚翟备色，而翾翥百步，肌丰而力沈也；鹰隼乏采，而翰飞戾天，骨劲而气猛也。文章才力，有似于此。若风骨乏采，则鸷集翰林；采乏风骨，则雉窜文囿；唯藻耀而高翔，固文笔之鸣凤也。若夫熔铸经典之范，翔集子史之术，洞晓情变，曲昭文体，然后能孚甲新意，雕昼奇辞。昭体，故意新而不乱，晓变，故辞奇而不黩。若骨采未圆，风辞未练，而跨略旧规，驰骛新作，虽获巧意，危败亦多，岂空结奇字，纰缪而成经矣？《周书》云∶“辞尚体要，弗惟好异。”盖防文滥也。然文术多门，各适所好，明者弗授，学者弗师。于是习华随侈，流遁忘反。若能确乎正式，使文明以健，则风清骨峻，篇体光华。能研诸虑，何远之有哉！\n赞曰∶\n情与气偕，辞共体并。文明以健，珪璋乃聘。\n蔚彼风力，严此骨鲠。才锋峻立，符采克炳。"
  }, {
    "id": "通变",
    "title": "通变第二十九",
    "text": "夫设文之体有常，变文之数无方，何以明其然耶？凡诗赋书记，名理相因，此有常之体也；文辞气力，通变则久，此无方之数也。名理有常，体必资于故实；通变无方，数必酌于新声；故能骋无穷之路，饮不竭之源。然绠短者衔渴，足疲者辍途，非文理之数尽，乃通变之术疏耳。故论文之方，譬诸草木，根干丽土而同性，臭味晞阳而异品矣。\n是以九代咏歌，志合文则。黄歌“断竹”，质之至也；唐歌在昔，则广于黄世；虞歌《卿云》，则文于唐时；夏歌“雕墙”，缛于虞代；商周篇什，丽于夏年。至于序志述时，其揆一也。暨楚之骚文，矩式周人；汉之赋颂，影写楚世；魏之篇制，顾慕汉风；晋之辞章，瞻望魏采。搉而论之，则黄唐淳而质，虞夏质而辨，商周丽而雅，楚汉侈而艳，魏晋浅而绮，宋初讹而新。从质及讹，弥近弥澹，何则？竞今疏古，风昧气衰也。\n今才颖之士，刻意学文，多略汉篇，师范宋集，虽古今备阅，然近附而远疏矣。夫青生于蓝，绛生于蒨，虽逾本色，不能复化。桓君山云∶“予见新进丽文，美而无采；及见刘扬言辞，常辄有得。”此其验也。故练青濯绛，必归蓝蒨；矫讹翻浅，还宗经诰。斯斟酌乎质文之间，而隐括乎雅俗之际，可与言通变矣。\n夫夸张声貌，则汉初已极，自兹厥后，循环相因，虽轩翥出辙，而终入笼内。枚乘《七发》云∶“通望兮东海，虹洞兮苍天。”相如《上林》云∶“视之无端，察之无涯，日出东沼，入乎西陂。”马融《广成》云∶“天地虹洞，固无端涯，大明出东，入乎西陂”。扬雄《校猎》云∶“出入日月，天与地沓”。张衡《西京》云∶“日月于是乎出入，象扶桑于濛汜。”此并广寓极状，而五家如一。诸如此类，莫不相循，参伍因革，通变之数也。\n是以规略文统，宜宏大体。先博览以精阅，总纲纪而摄契；然后拓衢路，置关键，长辔远驭，从容按节，凭情以会通，负气以适变，采如宛虹之奋鬐，光若长离之振翼，乃颖脱之文矣。若乃龌龊于偏解，矜激乎一致，此庭间之回骤，岂万里之逸步哉！\n赞曰∶\n文律运周，日新其业。变则可久，通则不乏。\n趋时必果，乘机无怯。望今制奇，参古定法。"
  }, {
    "id": "情采",
    "title": "情采第三十一",
    "text": "圣贤书辞，总称文章，非采而何？夫水性虚而沦漪结，木体实而花萼振，文附质也。虎豹无文，则鞟同犬羊；犀兕有皮，而色资丹漆，质待文也。若乃综述性灵，敷写器象，镂心鸟迹之中，织辞鱼网之上，其为彪炳，缛采名矣。\n故立文之道，其理有三∶一曰形文，五色是也；二曰声文，五音是也；三曰情文，五性是也。五色杂而成黼黻，五音比而成韶夏，五性发而为辞章，神理之数也。\n《孝经》垂典，丧言不文；故知君子常言，未尝质也。老子疾伪，故称“美言不信”，而五千精妙，则非弃美矣。庄周云“辩雕万物”，谓藻饰也。韩非云“艳乎辩说”，谓绮丽也。绮丽以艳说，藻饰以辩雕，文辞之变，于斯极矣。\n研味《孝》、《老》，则知文质附乎性情；详览《庄》、《韩》，则见华实过乎淫侈。若择源于泾渭之流，按辔于邪正之路，亦可以驭文采矣。夫铅黛所以饰容，而盼倩生于淑姿；文采所以饰言，而辩丽本于情性。故情者文之经，辞者理之纬；经正而后纬成，理定而后辞畅：此立文之本源也。\n昔诗人什篇，为情而造文；辞人赋颂，为文而造情。何以明其然？盖风雅之兴，志思蓄愤，而吟咏情性，以讽其上，此为情而造文也；诸子之徒，心非郁陶，苟驰夸饰，鬻声钓世，此为文而造情也。故为情者要约而写真，为文者淫丽而烦滥。而后之作者，采滥忽真，远弃风雅，近师辞赋，故体情之制日疏，逐文之篇愈盛。故有志深轩冕，而泛咏皋壤。心缠几务，而虚述人外。真宰弗存，翩其反矣。\n夫桃李不言而成蹊，有实存也；男子树兰而不芳，无其情也。夫以草木之微，依情待实；况乎文章，述志为本。言与志反，文岂足征？\n是以联辞结采，将欲明理，采滥辞诡，则心理愈翳。固知翠纶桂饵，反所以失鱼。“言隐荣华”，殆谓此也。是以“衣锦褧衣”，恶文太章；贲象穷白，贵乎反本。夫能设模以位理，拟地以置心，心定而后结音，理正而后攡藻，使文不灭质，博不溺心，正采耀乎朱蓝，间色屏于红紫，乃可谓雕琢其章，彬彬君子矣。\n赞曰∶\n言以文远，诚哉斯验。心术既形，英华乃赡。\n吴锦好渝，舜英徒艳。繁采寡情，味之必厌。"
  }, {
    "id": "神思",
    "title": "神思第二十六",
    "text": "古人云∶“形在江海之上，心存魏阙之下。”神思之谓也。文之思也，其神远矣。故寂然凝虑，思接千载；悄焉动容，视通万里；吟咏之间，吐纳珠玉之声；眉睫之前，卷舒风云之色；其思理之致乎！故思理为妙，神与物游。神居胸臆，而志气统其关键；物沿耳目，而辞令管其枢机。枢机方通，则物无隐貌；关键将塞，则神有遁心。\n是以陶钧文思，贵在虚静，疏瀹五藏，澡雪精神。积学以储宝，酌理以富才，研阅以穷照，驯致以怿辞，然后使元解之宰，寻声律而定墨；独照之匠，窥意象而运斤：此盖驭文之首术，谋篇之大端。\n夫神思方运，万涂竞萌，规矩虚位，刻镂无形。登山则情满于山，观海则意溢于海，我才之多少，将与风云而并驱矣。方其搦翰，气倍辞前，暨乎篇成，半折心始。何则？意翻空而易奇，言徵实而难巧也。是以意授于思，言授于意，密则无际，疏则千里。或理在方寸而求之域表，或义在咫尺而思隔山河。是以秉心养术，无务苦虑；含章司契，不必劳情也。人之禀才，迟速异分，文之制体，大小殊功。相如含笔而腐毫，扬雄辍翰而惊梦，桓谭疾感于苦思，王充气竭于思虑，张衡研京以十年，左思练都以一纪。虽有巨文，亦思之缓也。淮南崇朝而赋《骚》，枚皋应诏而成赋，子建援牍如口诵，仲宣举笔似宿构，阮禹据案而制书，祢衡当食而草奏，虽有短篇，亦思之速也。\n若夫骏发之士，心总要术，敏在虑前，应机立断；覃思之人，情饶歧路，鉴在虑后，研虑方定。机敏故造次而成功，虑疑故愈久而致绩。难易虽殊，并资博练。若学浅而空迟，才疏而徒速，以斯成器，未之前闻。是以临篇缀虑，必有二患∶理郁者苦贫，辞弱者伤乱，然则博见为馈贫之粮，贯一为拯乱之药，博而能一，亦有助乎心力矣。\n若情数诡杂，体变迁贸，拙辞或孕于巧义，庸事或萌于新意；视布于麻，虽云未贵，杼轴献功，焕然乃珍。至于思表纤旨，文外曲致，言所不追，笔固知止。至精而后阐其妙，至变而后通其数，伊挚不能言鼎，轮扁不能语斤，其微矣乎！\n赞曰∶\n神用象通，情变所孕。物心貌求，心以理应。\n刻镂声律，萌芽比兴。结虑司契，垂帷制胜。"
  }],
  "quotes": {
    "anxiety": "辞人爱奇，言贵浮诡",
    "enemy": "昔诗人什篇，为情而造文；辞人赋颂，为文而造情。",
    "wind": "结言端直，则文骨成焉；意气骏爽，则文风清焉。",
    "change": "夫设文之体有常，变文之数无方",
    "emotion": "文附质也。",
    "emotion2": "质待文也。",
    "purpose": "各照隅隙，鲜观衢路",
    "feeling": "繁采寡情，味之必厌。",
    "learning": "积学以储宝，酌理以富才，研阅以穷照，驯致以怿辞"
  }
};
// Editorial content: summaries rather than invented quotations or model-generated facts.
const SOURCES = {
  biography: {
    title: '《梁书》卷五十·刘勰传',
    url: 'https://zh.wikisource.org/wiki/梁書/卷50',
    type: '史传记录'
  },
  wind: {
    title: '童庆炳：《文心雕龙》“风清骨峻”说',
    url: 'https://www.aisixiang.com/data/89430.html',
    type: '学者本人论述／对前说的转述'
  },
  change: {
    title: '吴中胜、钟诗雅：关键词视野下的“通变”',
    url: 'https://www.cssn.cn/skgz/bwyc/202311/t20231107_5695203.shtml',
    type: '研究综述及作者观点'
  },
  emotion: {
    title: '童庆炳：《文心雕龙》“情经辞纬”说',
    url: 'https://www.aisixiang.com/data/89434.html',
    type: '学者本人论述／对前说的转述'
  },
  tang: {
    title: '陈子昂《修竹篇序》',
    url: 'https://m.gushiwen.cn/shiwenv_1c19e8df05df.aspx',
    type: '接受史中的原作，非刘勰注释'
  }
};
const TERMS = [{
  id: 'wind',
  name: '风骨',
  chapter: '风骨',
  tag: '思想情感 · 言辞力量',
  quoteKey: 'wind',
  plain: '先感受文章是否既有精神力量，又站得稳、说得有力；这只是入口，不是把“风骨”压成一种现代性格。',
  boundary: '不直接等同“有骨气”或“敢说真话”。争点之一，是“骨”更偏文辞的品质，还是支撑文章的事义。',
  views: [{
    id: 'wind-huang',
    name: '黄侃',
    era: '近代',
    work: '《文心雕龙札记》',
    summary: '从文意与文辞两个方面理解风、骨。',
    status: '据童庆炳转述；未据原书核页',
    source: 'wind'
  }, {
    id: 'wind-liu',
    name: '刘永济及相关论者',
    era: '现代',
    work: '《文心雕龙校释》等',
    summary: '侧重情志与事义，尤其重视文章的内容支撑。',
    status: '据童庆炳对学术史的梳理',
    source: 'wind'
  }, {
    id: 'wind-wang',
    name: '王运熙',
    era: '现代',
    work: '《从〈文心雕龙·风骨〉谈到建安风骨》',
    summary: '强调明朗刚健的艺术风格。',
    status: '据童庆炳转述；非直接引文',
    source: 'wind'
  }, {
    id: 'wind-tong',
    name: '童庆炳',
    era: '当代研究',
    work: '《文心雕龙》“风清骨峻”说',
    summary: '反对只用单一风格概括风骨，回到篇内证据讨论。',
    status: '据作者本人文章概述',
    source: 'wind'
  }],
  reception: {
    name: '陈子昂 · 唐代',
    summary: '以汉魏诗歌为标尺使用风骨，属于后世创作主张；不是对刘勰原义的逐句注释。',
    source: 'tang'
  }
}, {
  id: 'change',
  name: '通变',
  chapter: '通变',
  tag: '古典资源 · 变化的尺度',
  quoteKey: 'change',
  plain: '写作既要与已有经验接得上，也要面对新的表达需要；“通”与“变”各指什么，后人并不只有一种解释。',
  boundary: '不直接等同“守旧加创新”的公式；复古、创新与会通的关系才是待辨的问题。',
  views: [{
    id: 'change-ji',
    name: '纪昀',
    era: '清代',
    work: '《文心雕龙》评注',
    summary: '将通变的指向理解为复古。',
    status: '据吴中胜、钟诗雅综述',
    source: 'change'
  }, {
    id: 'change-liu',
    name: '刘永济',
    era: '现代',
    work: '《文心雕龙校释》',
    summary: '重视常与变的关系，不能只看作回到旧制。',
    status: '据吴中胜、钟诗雅综述',
    source: 'change'
  }, {
    id: 'change-tong',
    name: '童庆炳',
    era: '当代研究',
    work: '“会通适变”说新解',
    summary: '以会通古典、适应当下创作变革理解二者。',
    status: '据吴中胜、钟诗雅综述',
    source: 'change'
  }]
}, {
  id: 'emotion',
  name: '情采',
  chapter: '情采',
  tag: '情感如何成为作品',
  quoteKey: 'emotion',
  plain: '有感而发与语言经营怎样相互成就？不要把辞采只看成可有可无的装饰，也不要把真实经历直接当成文学。',
  boundary: '不能简单压成“内容大于形式”。“情”与“志”“理”的联系、情感向文字的转化，是不同解释的着力点。',
  views: [{
    id: 'emotion-huang',
    name: '黄侃',
    era: '近代',
    work: '《文心雕龙札记》',
    summary: '强调此篇纠正文采过盛、情实不足的针对性。',
    status: '据童庆炳转述；非直接引文',
    source: 'emotion'
  }, {
    id: 'emotion-wang',
    name: '王元化',
    era: '现代研究',
    work: '《文心雕龙讲疏》',
    summary: '从情与志的结合来理解相关命题。',
    status: '据童庆炳转述；未据原书核页',
    source: 'emotion'
  }, {
    id: 'emotion-tong',
    name: '童庆炳',
    era: '当代研究',
    work: '《文心雕龙》“情经辞纬”说',
    summary: '把情感转化为作品看作动态过程。',
    status: '据作者本人文章概述',
    source: 'emotion'
  }]
}];

// HTTP webpage: real server calls. Offline file: explicitly labelled local mocks.
// No API Key is ever sent to or stored in this frontend.
const isLiveReader = () => typeof location !== 'undefined' && ['http:', 'https:'].includes(location.protocol);
async function callReadingAPI(path, payload, signal) {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    signal
  });
  let body;
  try {
    body = await response.json();
  } catch {
    throw Error('阅读服务没有返回有效数据，请确认打开的是接入后端的网页。');
  }
  if (!response.ok) throw Error(typeof body.detail === 'string' ? body.detail : 'AI请求失败，请稍后重试。');
  return body;
}
function exactQuote(source, selected = '') {
  if (selected && source.includes(selected)) return selected;
  return source.match(/[^。！？\n]+[。！？]/)?.[0]?.trim() || source.trim();
}
function validateLab(answer, payload) {
  if (!['reality', 'critique', 'feynman'].includes(answer.path)) throw Error('无效引导路径');
  if (answer.quote && !payload.source_text.includes(answer.quote)) throw Error('引句未与原文匹配');
  if (!answer.question || /[？?]/g.test(answer.question) && [...answer.question.matchAll(/[？?]/g)].length !== 1) throw Error('每轮应只有一个核心问题');
  for (const id of answer.interpretation_ids || []) if (!(payload.interpretations || []).some(v => v.id === id)) throw Error('观点ID不在已核实资料中');
  return answer;
}
function createLabMock(payload) {
  if (!payload.source_text?.trim()) throw Error('请先选择一段原文');
  const input = (payload.user_input || '').trim();
  const path = /意思是|也就是|总结|白话|我的理解/.test(input) ? 'feynman' : /凭什么|不认同|不就是|但是|反对|套路|瞎|可是/.test(input) ? 'critique' : payload.next_path || 'reality';
  const quote = exactQuote(payload.source_text, payload.selected_text);
  const response = {
    mode: 'mock',
    path,
    acknowledgment: input ? `你写下了“${input.slice(0, 36)}${input.length > 36 ? '…' : ''}”。先把它作为待检验的判断。` : '先保留原句，用一个具体情境试读，不急于定论。',
    quote,
    source_ref: payload.chapter,
    interpretation_ids: (payload.interpretations || []).slice(0, 1).map(v => v.id),
    evidence_limit: '本轮是预设规则演示，不能判断你的解释是否正确。',
    scaffold: '',
    question: '',
    analogy_limit: null,
    next_path_hint: 'critique'
  };
  if (path === 'reality') {
    response.scaffold = '试作一个类比：一条短视频可以精心包装，也可以有具体经验作支撑；平台指标又可能反过来影响表达。';
    response.question = '用这段原文作依据，你会怎样区分“表达经过经营”和“为了获得关注而制造表达”？';
    response.analogy_limit = '当代平台的技术与商业机制，不等于齐梁文坛的评价机制。';
    response.next_path_hint = 'critique';
  } else if (path === 'critique') {
    response.scaffold = '先把作者的判断看作有条件的主张，而不是对所有时代、所有文体都成立的定律。';
    response.question = '你能提出一个具体作品或写作情境，检验这段判断在哪个条件下需要被限定吗？';
    response.next_path_hint = 'feynman';
  } else {
    response.scaffold = '这一步检验的是表达与证据之间的关系，不是看白话讲得多流利。';
    response.question = input ? '请把你的解释改写成两三句给同学听的白话，并让其中一个判断能与上面的原句直接对应。' : '请用两三句不依赖术语的白话，向没读过此书的同学说明这段文字最重要的关系。';
    response.next_path_hint = 'reality';
  }
  return validateLab(response, payload);
}
async function mockWait(signal) {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, 400);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('已取消', 'AbortError'));
    }, {
      once: true
    });
  });
}
async function requestThoughtLab(payload, {
  signal
} = {}) {
  if (isLiveReader()) return validateLab(await callReadingAPI('/api/thought-lab', payload, signal), payload);
  await mockWait(signal);
  return createLabMock(payload);
}
async function requestConcept(term, {
  signal
} = {}) {
  // TODO(MODEL): optionally retrieve reviewed interpretations server-side.
  // Current cards are researched editorial content, NOT generated scholarship.
  await mockWait(signal);
  return term;
}
async function requestSkim({
  source_text,
  chapter
}, {
  signal
} = {}) {
  if (isLiveReader()) return callReadingAPI('/api/skim', {
    source_text,
    chapter
  }, signal);
  await mockWait(signal);
  const maps = {
    风骨: '写文章既要让情感有力量，也要让措辞扎实，不能只顾漂亮。',
    通变: '写作有可继承的体制和经验，也有应当随创作而变化的表达方式。',
    情采: '情感与辞采需要彼此成就，语言经营不该遮蔽表达的实质。',
    序志: '刘勰希望回应他所批评的文风，并为文章建立较完整的讨论框架。',
    神思: '构思要让心与外物相接，也离不开学习、思考和语言训练。'
  };
  return {
    mode: 'mock',
    quote: exactQuote(source_text),
    sentence: maps[chapter] || '当前演示尚未覆盖这段文字的可靠白话概括。',
    limit: '这是按篇章预设的示意句，不能代替对你所选长句的精确解释。'
  };
}
const PATHS = {
  reality: '代入现实',
  critique: '寻找裂缝',
  feynman: '费曼检验'
};
const serif = {
  fontFamily: '"Songti SC", "Noto Serif SC", SimSun, serif'
};
function SourceLink({
  id
}) {
  const s = SOURCES[id];
  return /*#__PURE__*/React.createElement("a", {
    href: s.url,
    target: "_blank",
    rel: "noreferrer",
    className: "text-[11px] leading-6 text-[#728065] underline decoration-[#a5b196]/40 underline-offset-4"
  }, s.title, " \u2197");
}
function Badge({
  children,
  tone = 'green'
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: 'inline-block rounded border px-2 py-1 text-[10px] leading-4 ' + (tone === 'amber' ? 'border-[#e6d9be] bg-[#faf4e8] text-[#9b8055]' : 'border-[#d9e1cf] bg-[#f0f4e9] text-[#748563]')
  }, children);
}

/** React + TailwindCSS dashboard and connected browser-only reading demonstration. */
function ContextDashboard() {
  const live = isLiveReader();
  const [connection, setConnection] = useState(live ? 'checking' : 'demo');
  useEffect(() => {
    if (!live) return;
    fetch('/api/status').then(r => {
      if (!r.ok) throw Error();
      return r.json();
    }).then(s => setConnection(s.configured ? 'configured' : 'unconfigured')).catch(() => setConnection('unavailable'));
  }, []);
  const [page, setPage] = useState('dashboard'),
    [chapterId, setChapterId] = useState('序志'),
    [terms, setTerms] = useState({}),
    [concept, setConcept] = useState(null),
    [conceptLoading, setConceptLoading] = useState(false);
  const [labOpen, setLabOpen] = useState(false),
    [labText, setLabText] = useState(''),
    [labSource, setLabSource] = useState(''),
    [selection, setSelection] = useState(''),
    [turns, setTurns] = useState([]),
    [nextPath, setNextPath] = useState('reality'),
    [busy, setBusy] = useState(false),
    [skim, setSkim] = useState(null),
    [error, setError] = useState(''),
    [size, setSize] = useState(20),
    [notice, setNotice] = useState('');
  const article = useRef(null),
    request = useRef(null),
    closeButton = useRef(null),
    returnFocus = useRef(null),
    conceptRequest = useRef(null),
    labHeading = useRef(null);
  const chapter = CHAPTERS.chapters.find(c => c.id === chapterId),
    paragraphs = chapter.text.split(/\n+/).map(s => s.trim()).filter(Boolean);
  useEffect(() => {
    fetch('/api/preferences/interpretations').then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>setTerms(d.value)).catch(()=>setNotice('本机观点选择暂未读取成功，请刷新重试。'));
  }, []);
  useEffect(() => {
    if (concept) closeButton.current?.focus();
  }, [concept]);
  useEffect(() => {
    function escape(e) {
      if (e.key === 'Escape') closeConcept();
    }
    window.addEventListener('keydown', escape);
    return () => {
      window.removeEventListener('keydown', escape);
      request.current?.abort();
      conceptRequest.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (!concept) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [concept]);
  function closeConcept() {
    conceptRequest.current?.abort();
    setConcept(null);
    setConceptLoading(false);
    returnFocus.current?.focus();
  }
  function navigate(target) {
    request.current?.abort();
    setBusy(false);
    setPage(target);
    setSelection('');
    setSkim(null);
    setLabOpen(false);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  function openChapter(id) {
    request.current?.abort();
    setBusy(false);
    setChapterId(id);
    setTurns([]);
    setSelection('');
    setSkim(null);
    setLabSource('');
    setLabText('');
    setNextPath('reality');
    setError('');
    setPage('reader');
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  async function showConcept(term, e) {
    returnFocus.current = e?.currentTarget;
    conceptRequest.current?.abort();
    const ctrl = new AbortController();
    conceptRequest.current = ctrl;
    setConcept(term);
    setConceptLoading(true);
    try {
      await requestConcept(term, {
        signal: ctrl.signal
      });
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message);
    } finally {
      if (conceptRequest.current === ctrl) setConceptLoading(false);
    }
  }
  function selectView(term, view) {
    setTerms(old => {
      const updated = {
        ...old,
        [term.id]: view.id
      };
      fetch('/api/preferences/interpretations',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(updated)}).then(r=>{if(!r.ok)throw Error()}).catch(()=>setNotice('观点选择未保存成功，请重试。'));
      return updated;
    });
  }
  function selectedViews() {
    return TERMS.flatMap(t => t.views.filter(v => v.id === terms[t.id]));
  }
  function captureSelection() {
    const s = window.getSelection();
    if (!s || s.isCollapsed) {
      setSelection('');
      return;
    }
    if (article.current?.contains(s.anchorNode) && article.current?.contains(s.focusNode)) {
      const text = s.toString().trim();
      if (!chapter.text.includes(text)) return;
      if (text.length > 2000) {
        setError('请把一次划选控制在2000字以内。');
        return;
      }
      setSelection(text);
    }
  }
  function showLab(source = selection || paragraphs[0]) {
    if (labSource !== source) {
      request.current?.abort();
      setBusy(false);
      setTurns([]);
      setLabText('');
      setNextPath('reality');
    }
    setLabSource(source);
    setLabOpen(true);
    setError('');
    setTimeout(() => labHeading.current?.focus(), 0);
  }
  async function sendThought() {
    if (busy) return;
    const source = labSource || selection || paragraphs[0];
    if (!source.trim()) return;
    request.current?.abort();
    const ctrl = new AbortController();
    request.current = ctrl;
    setBusy(true);
    setError('');
    try {
      const response = await requestThoughtLab({
        book: '文心雕龙',
        edition: CHAPTERS.edition.name,
        chapter: chapter.title,
        source_text: source,
        selected_text: selection && source.includes(selection) ? selection : '',
        user_input: labText,
        conversation_history: turns.slice(-6),
        current_path: turns.at(-1)?.response.path,
        next_path: nextPath,
        interpretations: selectedViews()
      }, {
        signal: ctrl.signal
      });
      if (request.current !== ctrl) return;
      setTurns(old => [...old, {
        input: labText,
        response
      }]);
      setNextPath(response.next_path_hint);
      setLabText('');
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message);
    } finally {
      if (request.current === ctrl) setBusy(false);
    }
  }
  async function skimParagraph(text) {
    request.current?.abort();
    const ctrl = new AbortController();
    request.current = ctrl;
    setBusy(true);
    setError('');
    try {
      const response = await requestSkim({
        source_text: text,
        chapter: chapter.id
      }, {
        signal: ctrl.signal
      });
      if (request.current === ctrl) setSkim(response);
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message);
    } finally {
      if (request.current === ctrl) setBusy(false);
    }
  }
  function highlight(text) {
    return text.split(/(风骨|通变|情采|文采)/g).map((part, i) => {
      const t = TERMS.find(t => t.name === part) || (part === '文采' ? TERMS[2] : null);
      return t ? /*#__PURE__*/React.createElement("button", {
        key: i,
        className: "rounded-sm border-b border-dotted border-[#83996e] text-[#526d43] hover:bg-[#e9efdf]",
        style: {
          font: 'inherit'
        },
        "aria-label": part === '文采' ? '文采：查看情采相关讨论' : '解释' + part,
        onClick: e => showConcept(t, e)
      }, part) : part;
    });
  }
  const CardHead = ({
    number,
    kicker,
    title
  }) => /*#__PURE__*/React.createElement("div", {
    className: "mb-6 flex items-center gap-4"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-3xl italic text-[#b6bfa9]",
    style: serif
  }, number), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "mb-1 text-[9px] tracking-[.17em] text-[#9aa48d]"
  }, kicker), /*#__PURE__*/React.createElement("h2", {
    className: "text-lg tracking-wider text-[#3d4d35]",
    style: serif
  }, title)));
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen bg-[#FBF8F1] text-[#35422f]"
  }, /*#__PURE__*/React.createElement("header", {
    className: "mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 border-b border-[#dfe3d5] px-6 py-5 sm:px-10"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => navigate('dashboard'),
    className: "flex items-center gap-3 text-left"
  }, /*#__PURE__*/React.createElement("span", {
    className: "grid h-10 w-10 place-items-center rounded-sm bg-[#506548] text-2xl text-[#fffaf0]",
    style: serif
  }, "\u6587"), /*#__PURE__*/React.createElement("span", {
    className: "text-lg tracking-[.12em]",
    style: serif
  }, "\u6587\u8BBA\u4F34\u8BFB", /*#__PURE__*/React.createElement("small", {
    className: "mt-1 block font-sans text-[8px] tracking-[.18em] text-[#99a28d]"
  }, "READ \xB7 QUESTION \xB7 RECONSIDER"))), /*#__PURE__*/React.createElement("nav", {
    className: "order-3 flex w-full gap-6 text-xs sm:order-none sm:w-auto",
    "aria-label": "\u9605\u8BFB\u9636\u6BB5"
  }, [['dashboard', '01 外围突破'], ['reader', '02 核心攻坚']].map(([id, label]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    onClick: () => navigate(id),
    "aria-current": page === id ? 'page' : undefined,
    className: 'pb-2 ' + (page === id ? 'border-b border-[#5a744d] text-[#4e6741]' : 'text-[#a2aa96]')
  }, label)), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setPage('reader');
      showLab();
    },
    className: "pb-2 text-[#89977d]"
  }, "03 随行导师")), /*#__PURE__*/React.createElement("button", {
    onClick: () => navigate('connect'),
    className: "text-[10px] text-[#8d9a7e]"
  }, connection === 'configured' ? 'AI已配置 · gpt-5' : connection === 'checking' ? '正在检查AI服务' : connection === 'demo' ? '离线模拟演示' : 'AI服务未连接', " \u2197")), page === 'dashboard' && /*#__PURE__*/React.createElement("main", {
    className: "mx-auto max-w-7xl px-5 pb-12 pt-10 sm:px-10 sm:pt-14"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mb-10 grid gap-9 md:grid-cols-[1fr_280px]"
  }, /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("p", {
    className: "mb-4 text-[10px] tracking-[.24em] text-[#7b8e6c]"
  }, "\u4EBA\u6587\u7ECF\u5178\u4E09\u9636\u6BB5\u9605\u8BFB\u6CD5 / \u7B2C\u4E00\u9636\u6BB5"), /*#__PURE__*/React.createElement("h1", {
    className: "mb-4 text-4xl font-normal tracking-[.12em] sm:text-5xl",
    style: serif
  }, "\u6587\u5FC3\u96D5\u9F99"), /*#__PURE__*/React.createElement("p", {
    className: "mb-5 text-xs text-[#9ba48d]"
  }, "\u5218\u52F0 \xB7 \u5357\u671D\u9F50\u6881\u4E4B\u9645 ", /*#__PURE__*/React.createElement("span", {
    className: "mx-3"
  }, "/"), " Context Dashboard"), /*#__PURE__*/React.createElement("p", {
    className: "max-w-xl text-sm leading-8 text-[#7c8970]"
  }, "\u5148\u4E0D\u6025\u7740\u5543\u4E0B\u6BCF\u4E00\u53E5\u3002\u770B\u6E05\u8FD9\u672C\u4E66\u8BD5\u56FE\u56DE\u5E94\u7684\u6587\u98CE\u4E0E\u5199\u4F5C\u95EE\u9898\uFF0C", /*#__PURE__*/React.createElement("br", {
    className: "hidden sm:block"
  }), "\u5E26\u7740\u51E0\u4E2A\u53EF\u4FEE\u8BA2\u7684\u6982\u5FF5\uFF0C\u518D\u8FDB\u5165\u539F\u6587\u3002"), /*#__PURE__*/React.createElement("div", {
    className: "mt-6 flex flex-wrap items-center gap-4"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => openChapter('序志'),
    className: "rounded bg-[#536d49] px-6 py-3 text-xs tracking-wider text-white hover:bg-[#405b38]"
  }, "\u4ECE\u300A\u5E8F\u5FD7\u300B\u8FDB\u5165\u539F\u6587 \u2197"), /*#__PURE__*/React.createElement("a", {
    href: "#concepts",
    className: "text-xs text-[#8e9a7f] underline underline-offset-4"
  }, "\u5148\u770B\u770B\u4E09\u7EC4\u6838\u5FC3\u6982\u5FF5"))), /*#__PURE__*/React.createElement("aside", {
    className: "relative border-l border-[#d6dfc9] py-1 pl-7"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mb-5 block text-[9px] tracking-[.2em] text-[#9ea891]"
  }, "\u4F5C\u8005\u81EA\u8FF0 \xB7 \u300A\u5E8F\u5FD7\u300B"), /*#__PURE__*/React.createElement("blockquote", {
    className: "text-xl leading-loose tracking-wider text-[#748968]",
    style: serif
  }, "\u4E8E\u662F\u6426\u7B14\u548C\u58A8\uFF0C", /*#__PURE__*/React.createElement("br", null), "\u4E43\u59CB\u8BBA\u6587\u3002"), /*#__PURE__*/React.createElement("p", {
    className: "mt-4 text-[10px] leading-6 text-[#a3ab98]"
  }, "\u5148\u95EE\u4ED6\u4E3A\u4F55\u52A8\u7B14\uFF0C", /*#__PURE__*/React.createElement("br", null), "\u518D\u95EE\u6211\u4EEC\u53EF\u4EE5\u600E\u6837\u8BFB\u3002"))), /*#__PURE__*/React.createElement("div", {
    className: "mb-7 rounded border border-[#e3e7da] bg-[#f4f5ec] px-5 py-3 text-[10px] leading-6 text-[#8b977b]"
  }, "\u5F53\u524D\u8BD5\u7528\u5E95\u672C\uFF1A", CHAPTERS.edition.name, "\u3002\u65E0\u6821\u6CE8\u8005\u4E0E\u51FA\u7248\u793E\u4FE1\u606F\uFF1B\u4E0D\u7F16\u9020\u9875\u7801\u3002", /*#__PURE__*/React.createElement("span", {
    className: "block sm:inline"
  }, " \u539F\u6587\u6458\u5F55\u3001\u5386\u53F2\u8BB0\u5F55\u3001\u7814\u7A76\u8F6C\u8FF0\u3001\u4EA7\u54C1\u5BFC\u8BFB\u5206\u522B\u6807\u6CE8\u3002")), /*#__PURE__*/React.createElement("div", {
    className: "grid gap-6 lg:grid-cols-2"
  }, /*#__PURE__*/React.createElement("section", {
    className: "rounded-lg border border-[#e0e5d6] bg-[#fffdf8] p-6 sm:p-8"
  }, /*#__PURE__*/React.createElement(CardHead, {
    number: "01",
    kicker: "HISTORICAL CONTEXT",
    title: "\u4F5C\u8005\u7684\u65F6\u4EE3\u7126\u8651"
  }), /*#__PURE__*/React.createElement("p", {
    className: "mb-6 text-xs leading-7 text-[#8e9982]"
  }, "\u8FD9\u91CC\u7684\u201C\u7126\u8651\u201D\u6307\u5199\u4F5C\u6240\u56DE\u5E94\u7684\u95EE\u9898\uFF0C\u4E0D\u66FF\u4F5C\u8005\u731C\u6D4B\u5FC3\u7406\u3002"), /*#__PURE__*/React.createElement("div", {
    className: "mb-6 border-l-2 border-[#a7b995] pl-4"
  }, /*#__PURE__*/React.createElement(Badge, null, "\u4F5C\u8005\u660E\u786E\u81EA\u8FF0"), /*#__PURE__*/React.createElement("blockquote", {
    className: "my-3 text-base leading-8",
    style: serif
  }, "\u201C", CHAPTERS.quotes.anxiety, "\u201D"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs leading-7 text-[#77856b]"
  }, "\u300A\u5E8F\u5FD7\u300B\u628A\u6C42\u5947\u3001\u6D6E\u8BE1\u4E0E\u8FDC\u79BB\u7ECF\u5178\u6839\u672C\u8054\u7CFB\u8D77\u6765\uFF0C\u4EA4\u4EE3\u4E86\u52A8\u7B14\u8BBA\u6587\u7684\u7406\u7531\u3002\u5B83\u662F\u5218\u52F0\u7684\u8BC4\u4EF7\uFF0C\u4E0D\u80FD\u76F4\u63A5\u5F53\u4F5C\u6574\u4E2A\u65F6\u4EE3\u7684\u5BA2\u89C2\u5168\u8C8C\u3002")), /*#__PURE__*/React.createElement("div", {
    className: "mb-6"
  }, /*#__PURE__*/React.createElement(Badge, null, "\u5386\u53F2\u5904\u5883\u4E0E\u53F2\u4F20\u8BB0\u5F55"), /*#__PURE__*/React.createElement("p", {
    className: "mt-3 text-xs leading-7 text-[#77856b]"
  }, "\u9F50\u6881\u4E4B\u9645\uFF0C\u6587\u4F53\u3001\u8F9E\u91C7\u4E0E\u6587\u7AE0\u6807\u51C6\u662F\u91CD\u8981\u8BAE\u9898\u3002\u300A\u6881\u4E66\u300B\u8BB0\u5218\u52F0\u66FE\u4F9D\u50E7\u7950\u3001\u6574\u7406\u7ECF\u85CF\uFF0C\u53C8\u8BB0\u5176\u8457\u4E66\u540E\u6C42\u6C88\u7EA6\u8BC4\u9605\uFF1B\u8FD9\u4E9B\u7ECF\u5386\u53EF\u4F5C\u77E5\u8BC6\u73AF\u5883\u7684\u7EBF\u7D22\uFF0C\u4E0D\u81EA\u52A8\u7B49\u4E8E\u552F\u4E00\u601D\u60F3\u6765\u6E90\u3002"), /*#__PURE__*/React.createElement(SourceLink, {
    id: "biography"
  })), /*#__PURE__*/React.createElement("div", {
    className: "rounded bg-[#f5f4eb] p-4"
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "amber"
  }, "\u5BFC\u8BFB\u91CD\u6784 \xB7 \u53EF\u8D28\u7591"), /*#__PURE__*/React.createElement("p", {
    className: "mt-3 text-xs leading-7 text-[#889175]"
  }, "\u4E00\u8FB9\u662F\u4E30\u5BCC\u7684\u5199\u4F5C\u5B9E\u8DF5\uFF0C\u4E00\u8FB9\u662F\u4ED6\u8BA4\u4E3A\u9700\u8981\u6821\u6B63\u7684\u8BC4\u4EF7\u503E\u5411\uFF1A\u6587\u7AE0\u600E\u6837\u65E2\u6709\u6587\u91C7\uFF0C\u53C8\u4E0D\u5931\u60C5\u5B9E\u3001\u4F53\u8981\u4E0E\u5224\u65AD\u6807\u51C6\uFF1F"))), /*#__PURE__*/React.createElement("section", {
    className: "rounded-lg border border-[#e0e5d6] bg-[#fffdf8] p-6 sm:p-8"
  }, /*#__PURE__*/React.createElement(CardHead, {
    number: "02",
    kicker: "THE ARGUMENT HE ENTERED",
    title: "\u6838\u5FC3\u5047\u60F3\u654C"
  }), /*#__PURE__*/React.createElement("p", {
    className: "mb-5 text-xs leading-7 text-[#8e9982]"
  }, "\u4E0D\u662F\u9501\u5B9A\u4E00\u4E2A\u654C\u4EBA\uFF0C\u800C\u662F\u8FA8\u8BA4\u4ED6\u53CD\u5BF9\u7684\u5199\u4F5C\u4E60\u60EF\u4E0E\u6279\u8BC4\u65B9\u5F0F\u3002\u4EE5\u4E0B\u6982\u62EC\u4E0D\u8868\u793A\u5F53\u65F6\u4EBA\u4EBA\u5982\u6B64\u3002"), [['01', '把求奇当成文章价值', '《序志》', CHAPTERS.quotes.anxiety, '他质疑的不是一切新意，而是与体要、根本脱节的求奇。'], ['02', '为获得声名而倒造情感', '《情采》', CHAPTERS.quotes.enemy, '原文区分两类写作动机，但“真实感受如何变成作品”仍可继续追问。'], ['03', '只见一隅的批评方式', '《序志》', CHAPTERS.quotes.purpose, '他评论前论所见有限，试图建立更周全的讨论；不是否认前人的全部贡献。']].map(([n, title, ref, quote, description]) => /*#__PURE__*/React.createElement("div", {
    key: n,
    className: "mb-5 border-b border-[#edf0e5] pb-5 last:mb-0 last:border-0 last:pb-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex gap-3"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs text-[#a5b096]"
  }, n), /*#__PURE__*/React.createElement("h3", {
    className: "text-sm",
    style: serif
  }, title)), /*#__PURE__*/React.createElement("p", {
    className: "mt-2 text-xs leading-7 text-[#849075]"
  }, description), /*#__PURE__*/React.createElement("details", {
    className: "mt-2 text-[10px] leading-7 text-[#98a489]"
  }, /*#__PURE__*/React.createElement("summary", {
    className: "cursor-pointer"
  }, "\u770B\u539F\u6587\u4F9D\u636E ", ref), /*#__PURE__*/React.createElement("blockquote", {
    className: "mt-2 border-l border-[#c0cdb3] pl-3 text-xs"
  }, quote)))))), /*#__PURE__*/React.createElement("section", {
    id: "concepts",
    className: "mt-7 scroll-mt-6 rounded-lg border border-[#dfe5d4] bg-[#fffdf8] p-6 sm:p-8"
  }, /*#__PURE__*/React.createElement(CardHead, {
    number: "03",
    kicker: "CONCEPTS, NOT DEFINITIONS TO MEMORIZE",
    title: "\u5FC5\u61C2\u7684 3 \u4E2A\u6838\u5FC3\u9ED1\u8BDD"
  }), /*#__PURE__*/React.createElement("p", {
    className: "mb-7 text-xs leading-7 text-[#8d9980]"
  }, "\u5148\u6709\u4E00\u4E2A\u901A\u4FD7\u5165\u53E3\uFF0C\u518D\u6BD4\u8F83\u4E0D\u540C\u89E3\u91CA\u3002\u6682\u53D6\u4E00\u8BF4\uFF0C\u662F\u4E3A\u4E86\u5E26\u7740\u8BC1\u636E\u8BFB\u4E0B\u53BB\uFF0C\u4E0D\u662F\u66FF\u81EA\u5DF1\u9009\u4E00\u4E2A\u6807\u51C6\u7B54\u6848\u3002"), /*#__PURE__*/React.createElement("div", {
    className: "grid gap-5 md:grid-cols-3"
  }, TERMS.map((term, i) => /*#__PURE__*/React.createElement("article", {
    key: term.id,
    className: "flex flex-col rounded-md border border-[#e4e9dc] bg-[#f8f9f1] p-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[9px] tracking-widest text-[#9fae92]"
  }, "CONCEPT / 0", i + 1), /*#__PURE__*/React.createElement("span", {
    className: "text-[9px] text-[#9ead8e]"
  }, term.views.length, " \u79CD\u5177\u540D\u8BFB\u6CD5")), /*#__PURE__*/React.createElement("h3", {
    className: "my-4 text-3xl tracking-widest",
    style: serif
  }, term.name), /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] text-[#94a086]"
  }, term.tag), /*#__PURE__*/React.createElement("p", {
    className: "my-4 text-xs leading-7 text-[#7f8d70]"
  }, term.plain), /*#__PURE__*/React.createElement("p", {
    className: "mb-5 text-[10px] leading-6 text-[#a3ac98]"
  }, "\u8FB9\u754C\uFF1A", term.boundary), /*#__PURE__*/React.createElement("div", {
    className: "mb-5 flex flex-wrap gap-2"
  }, term.views.slice(0, 3).map(view => /*#__PURE__*/React.createElement("span", {
    key: view.id,
    className: "rounded border border-[#dfe6d4] bg-[#fffdf7] px-2 py-1 text-[9px] text-[#90a07f]"
  }, view.name))), /*#__PURE__*/React.createElement("button", {
    onClick: e => showConcept(term, e),
    className: "mt-auto self-start border-b border-[#9fb18d] pb-1 text-xs text-[#6a8059]"
  }, "\u6BD4\u8F83\u540D\u5BB6\u89E3\u91CA ", terms[term.id] ? '· 已暂取一说' : '', " \u2197"))))), /*#__PURE__*/React.createElement("section", {
    className: "mt-7 flex flex-wrap items-center justify-between gap-5 rounded-lg bg-[#eaf0df] p-6 sm:p-8"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "mb-2 text-[9px] tracking-[.2em] text-[#8a9c77]"
  }, "NEXT / \u6838\u5FC3\u653B\u575A"), /*#__PURE__*/React.createElement("h2", {
    className: "text-lg",
    style: serif
  }, "\u642D\u597D\u811A\u624B\u67B6\uFF0C\u5C31\u53BB\u8BFB\u539F\u6587\u3002"), /*#__PURE__*/React.createElement("p", {
    className: "mt-2 text-xs text-[#8c9c7b]"
  }, "\u4ECE\u300A\u5E8F\u5FD7\u300B\u627E\u95EE\u9898\u610F\u8BC6\uFF0C\u518D\u5230\u300A\u98CE\u9AA8\u300B\u300A\u901A\u53D8\u300B\u300A\u60C5\u91C7\u300B\u68C0\u9A8C\u3002")), /*#__PURE__*/React.createElement("button", {
    onClick: () => openChapter('序志'),
    className: "rounded bg-[#536d49] px-6 py-3 text-xs text-white"
  }, "\u8FDB\u5165\u9605\u8BFB \u2197")), /*#__PURE__*/React.createElement("details", {
    className: "mt-8 text-xs text-[#9da68f]"
  }, /*#__PURE__*/React.createElement("summary", {
    className: "cursor-pointer"
  }, "\u8D44\u6599\u6765\u6E90\u4E0E\u6838\u5B9E\u8FB9\u754C"), /*#__PURE__*/React.createElement("p", {
    className: "mt-4 leading-7"
  }, "\u5BFC\u8BFB\u539F\u53E5\u5DF2\u4E0E\u672C\u6B21\u684C\u9762TXT\u9010\u5B57\u6838\u5BF9\u3002\u540D\u5BB6\u5361\u7247\u662F\u7B80\u660E\u8F6C\u8FF0\uFF1B\u672A\u67E5\u539F\u4E66\u65F6\u660E\u786E\u6807\u6CE8\uFF0C\u4E0D\u5192\u5145\u5B66\u8005\u76F4\u63A5\u5F15\u6587\uFF0C\u4E0D\u7F16\u9875\u7801\u3002\u5F53\u524D\u5217\u51FA\u6E05\u4EE3\u81F3\u8FD1\u73B0\u4EE3\u7684\u82E5\u5E72\u89E3\u91CA\uFF0C\u5E76\u5355\u5217\u5510\u4EE3\u63A5\u53D7\u53F2\u7EBF\u7D22\uFF1B\u5C1A\u672A\u636E\u5B9E\u8865\u9F50\u5B8B\u4EE3\u89E3\u91CA\uFF0C\u4E0D\u4E3A\u51D1\u5E74\u4EE3\u7F16\u9020\u3002"), /*#__PURE__*/React.createElement("div", {
    className: "mt-3 grid gap-2"
  }, Object.keys(SOURCES).map(id => /*#__PURE__*/React.createElement(SourceLink, {
    key: id,
    id: id
  }))))), page === 'reader' && /*#__PURE__*/React.createElement("main", {
    className: "mx-auto max-w-7xl px-5 pb-16 pt-9 sm:px-10"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mb-7 flex flex-wrap items-center justify-between gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "mb-2 text-[9px] tracking-[.2em] text-[#8c9b7e]"
  }, "\u7B2C\u4E8C\u9636\u6BB5 / \u6838\u5FC3\u653B\u575A"), /*#__PURE__*/React.createElement("h1", {
    className: "text-2xl",
    style: serif
  }, "\u6587\u5FC3\u96D5\u9F99 \xB7 ", chapter.id)), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "chapter",
    className: "text-xs text-[#95a18a]"
  }, "\u7BC7\u7AE0"), /*#__PURE__*/React.createElement("select", {
    id: "chapter",
    value: chapterId,
    onChange: e => openChapter(e.target.value),
    className: "max-w-[160px] rounded border border-[#dce4d2] bg-transparent p-2 text-xs"
  }, CHAPTERS.chapters.map(c => /*#__PURE__*/React.createElement("option", {
    key: c.id,
    value: c.id
  }, c.title))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSize(s => Math.max(17, s - 1)),
    className: "p-2 text-xs",
    "aria-label": "\u7F29\u5C0F\u5B57\u53F7"
  }, "A\u2212"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSize(s => Math.min(27, s + 1)),
    className: "p-2 text-xs",
    "aria-label": "\u653E\u5927\u5B57\u53F7"
  }, "A+"))), /*#__PURE__*/React.createElement("p", {
    className: "mb-8 text-[10px] leading-6 text-[#9fa992]"
  }, "\u7528\u6237TXT\u539F\u6587\u6458\u5F55 \xB7 5\u7BC7\u8BD5\u8BFB\uFF0C\u975E\u5168\u4E66\u66FF\u4EE3\u7248 \xB7 \u70B9\u51FB\u5E26\u70B9\u7EBF\u7684\u6982\u5FF5\u770B\u591A\u79CD\u8BFB\u6CD5\u3002", live ? '跳读和随行导师通过服务端调用真实AI；失败时会报错，不以假数据替代。' : '离线文件中的跳读与对话为规则模拟。'), /*#__PURE__*/React.createElement("div", {
    className: 'grid items-start gap-8 ' + (labOpen ? 'lg:grid-cols-[1fr_380px]' : '')
  }, /*#__PURE__*/React.createElement("section", {
    className: "mx-auto w-full max-w-[740px] rounded-lg border border-[#e2e7d7] bg-[#fffdf7] p-6 sm:p-10"
  }, /*#__PURE__*/React.createElement("article", {
    ref: article,
    onMouseUp: captureSelection,
    onTouchEnd: () => setTimeout(captureSelection, 120),
    className: "space-y-7 break-words leading-[1.8] tracking-[.035em]",
    style: {
      ...serif,
      fontSize: size
    }
  }, paragraphs.map((p, i) => /*#__PURE__*/React.createElement("section", {
    key: chapterId + i
  }, /*#__PURE__*/React.createElement("p", {
    className: "whitespace-pre-wrap"
  }, highlight(p)), p.length > 100 && /*#__PURE__*/React.createElement("div", {
    className: "mt-3 flex gap-4 font-sans text-[10px] tracking-normal"
  }, /*#__PURE__*/React.createElement("button", {
    disabled: busy,
    onClick: () => skimParagraph(p),
    className: "text-[#8c9e7c]"
  }, "AI \u5E2E\u6211\u8DF3\u8BFB \u2197"), /*#__PURE__*/React.createElement("button", {
    onClick: () => showLab(p),
    className: "text-[#8c9e7c]"
  }, "\u5E26\u8FD9\u6BB5\u53BB\u5B9E\u9A8C\u5BA4 \u2192"))))), skim && /*#__PURE__*/React.createElement("aside", {
    className: "mt-7 rounded border border-[#dce6ce] bg-[#f0f5e7] p-5 text-xs leading-7"
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "amber"
  }, skim.mode === 'live' ? '真实AI · 一句话跳读' : '跳读示意 · 预设假数据'), /*#__PURE__*/React.createElement("p", {
    className: "mt-3 text-sm"
  }, skim.sentence), /*#__PURE__*/React.createElement("p", {
    className: "mt-2 text-[10px] text-[#99a88a]"
  }, skim.limit, " \u8BF7\u56DE\u539F\u6587\u6838\u5BF9\u3002"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSkim(null),
    className: "mt-2 text-[10px] underline"
  }, "\u6536\u8D77")), selection && /*#__PURE__*/React.createElement("div", {
    className: "sticky bottom-5 mt-6 rounded-md border border-[#cfdcbe] bg-[#edf4e4] p-3 shadow-lg"
  }, /*#__PURE__*/React.createElement("p", {
    className: "mb-2 text-[10px] text-[#829473]"
  }, "\u5DF2\u9009 ", selection.length, " \u5B57"), /*#__PURE__*/React.createElement("button", {
    onClick: () => showLab(selection),
    className: "rounded bg-[#546d47] px-4 py-2 text-xs text-white"
  }, "\u6C42\u52A9 AI \xB7 \u542F\u53D1\u6211 \u2197"))), labOpen && /*#__PURE__*/React.createElement("aside", {
    className: "fixed inset-x-0 bottom-0 z-30 max-h-[82dvh] overflow-y-auto rounded-t-2xl border border-[#d7e2c9] bg-[#f6f8ee] p-6 shadow-xl lg:sticky lg:top-5 lg:inset-auto lg:z-auto lg:max-h-[85dvh] lg:rounded-lg lg:shadow-none"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mb-4 flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "mb-1 text-[9px] tracking-widest text-[#9caa8c]"
  }, "THOUGHT LAB"), /*#__PURE__*/React.createElement("h2", {
    ref: labHeading,
    tabIndex: "-1",
    className: "text-xl",
    style: serif
  }, "随行导师")), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      request.current?.abort();
      setBusy(false);
      setLabOpen(false);
    },
    "aria-label": "\u6536\u8D77随行导师",
    className: "text-xs text-[#93a183]"
  }, "\u6536\u8D77 \u2193")), /*#__PURE__*/React.createElement(Badge, {
    tone: "amber"
  }, live ? '服务端真实AI · gpt-5' : '规则模拟 · 未调用大模型'), /*#__PURE__*/React.createElement("details", {
    className: "mt-4 text-[10px] leading-7 text-[#8b9c7b]"
  }, /*#__PURE__*/React.createElement("summary", {
    className: "cursor-pointer"
  }, "\u672C\u8F6E\u539F\u6587 \xB7 ", chapter.title), /*#__PURE__*/React.createElement("blockquote", {
    className: "mt-2 max-h-32 overflow-auto border-l border-[#b7c9a4] pl-3"
  }, labSource || paragraphs[0])), /*#__PURE__*/React.createElement("div", {
    className: "my-5 flex flex-wrap gap-2"
  }, Object.entries(PATHS).map(([id, label]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    onClick: () => setNextPath(id),
    "aria-pressed": nextPath === id,
    className: 'rounded-full border px-3 py-1 text-[10px] ' + (nextPath === id ? 'border-[#a6bc90] bg-[#e9f0dd] text-[#587147]' : 'border-[#e0e7d6] text-[#9eab90]')
  }, label))), /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] leading-6 text-[#9eaa92]"
  }, "\u6BCF\u6B21\u53EA\u63A8\u8FDB\u4E00\u4E2A\u6838\u5FC3\u95EE\u9898\u3002\u6807\u7B7E\u662F\u4E0B\u4E00\u8F6E\u5EFA\u8BAE\uFF1B\u767D\u8BDD\u603B\u7ED3\u6216\u660E\u786E\u53CD\u5BF9\u4F1A\u4F18\u5148\u89E6\u53D1\u5BF9\u5E94\u68C0\u9A8C\u3002"), turns.map((turn, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "mt-5 border-t border-[#dfe7d4] pt-4"
  }, turn.input && /*#__PURE__*/React.createElement("p", {
    className: "mb-4 rounded bg-[#e9efdf] p-3 text-xs leading-7"
  }, "\u6211\uFF1A", turn.input), /*#__PURE__*/React.createElement("p", {
    className: "mb-2 text-[9px] text-[#9eac8f]"
  }, PATHS[turn.response.path], " \xB7 ", turn.response.mode === 'live' ? '真实AI' : '模拟', "\u7B2C", i + 1, "\u8F6E"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs leading-7 text-[#8a9a7a]"
  }, turn.response.acknowledgment), /*#__PURE__*/React.createElement("blockquote", {
    className: "my-3 border-l-2 border-[#adc29a] pl-3 text-xs leading-7",
    style: serif
  }, turn.response.quote), /*#__PURE__*/React.createElement("p", {
    className: "text-xs leading-7 text-[#8c9b7b]"
  }, turn.response.scaffold), /*#__PURE__*/React.createElement("p", {
    className: "my-3 text-sm leading-7 text-[#526a41]"
  }, turn.response.question), turn.response.analogy_limit && /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] leading-6 text-[#a1ac94]"
  }, "\u7C7B\u6BD4\u8FB9\u754C\uFF1A", turn.response.analogy_limit), /*#__PURE__*/React.createElement("p", {
    className: "mt-2 text-[9px] leading-6 text-[#a8af9c]"
  }, turn.response.evidence_limit))), /*#__PURE__*/React.createElement("label", {
    htmlFor: "lab-text",
    className: "mb-2 mt-5 block text-xs text-[#81946e]"
  }, "\u5410\u69FD\u3001\u767D\u8BDD\u603B\u7ED3\uFF0C\u6216\u672C\u8F6E\u7684\u56DE\u7B54"), /*#__PURE__*/React.createElement("textarea", {
    id: "lab-text",
    rows: "4",
    maxLength: "2000",
    value: labText,
    onChange: e => setLabText(e.target.value),
    placeholder: "\u6211\u7684\u7406\u89E3\u662F\u2026\u2026\u539F\u53E5\u7684\u4F9D\u636E\u662F\u2026\u2026",
    className: "w-full resize-y rounded border border-[#dbe4cd] bg-[#fffef8] p-3 text-sm leading-7"
  }), /*#__PURE__*/React.createElement("button", {
    disabled: busy,
    onClick: sendThought,
    className: "mt-3 w-full rounded bg-[#546e47] px-5 py-3 text-xs text-white"
  }, busy ? live ? 'AI正在阅读原文，请稍候……' : '准备模拟追问……' : turns.length ? '回应后，继续一步' : '开始这一轮'))), !labOpen && /*#__PURE__*/React.createElement("button", {
    onClick: () => showLab(),
    className: "fixed bottom-6 right-5 rounded-full bg-[#526d45] px-6 py-4 text-xs text-white shadow-lg"
  }, "\u2727 \u6253\u5F00随行导师")), page === 'connect' && /*#__PURE__*/React.createElement("main", {
    className: "mx-auto max-w-3xl px-6 py-12"
  }, /*#__PURE__*/React.createElement("p", {
    className: "mb-4 text-[10px] tracking-widest text-[#91a17f]"
  }, "\u63A5\u5165\u8BF4\u660E / \u5F53\u524D\u65E0\u9700 API"), /*#__PURE__*/React.createElement("h1", {
    className: "mb-7 text-3xl leading-relaxed",
    style: serif
  }, "\u4FDD\u7559\u9605\u8BFB\u65B9\u6CD5\uFF0C", /*#__PURE__*/React.createElement("br", null), "\u63A5\u5165\u771F\u5B9E\u6A21\u578B\u3002"), /*#__PURE__*/React.createElement("div", {
    className: "rounded-lg border border-[#dfe5d5] bg-[#fffdf7] p-6 text-sm leading-8 text-[#849572]"
  }, /*#__PURE__*/React.createElement("p", null, "\u5BFC\u8BFB\u548C\u5B66\u8005\u89C2\u70B9\u5361\u7247\u662F\u6709\u6765\u6E90\u7684\u7F16\u8F91\u5185\u5BB9\uFF0C\u4E0D\u662F\u5047\u5B66\u672F\u8D44\u6599\u3002", live ? '当前HTTP网页的思想实验与跳读已接入真实模型。' : '离线文件中的思想实验与跳读仍是预设假数据。'), /*#__PURE__*/React.createElement("p", {
    className: "mt-4"
  }, "\u672A\u6765\u6A21\u578B\u8C03\u7528\u96C6\u4E2D\u5728 ", /*#__PURE__*/React.createElement("code", {
    className: "rounded bg-[#eef3e5] px-1 text-xs"
  }, "requestThoughtLab()"), "\u3001", /*#__PURE__*/React.createElement("code", {
    className: "rounded bg-[#eef3e5] px-1 text-xs"
  }, "requestSkim()"), " \u548C ", /*#__PURE__*/React.createElement("code", {
    className: "rounded bg-[#eef3e5] px-1 text-xs"
  }, "requestConcept()"), "\u3002\u601D\u60F3\u5B9E\u9A8C\u4E0E\u8DF3\u8BFB\u5DF2\u63A5\u5165\u540C\u6E90\u540E\u7AEF\uFF1B\u6982\u5FF5\u5361\u7247\u4ECD\u4F7F\u7528\u7ECF\u6838\u5B9E\u7684\u7F16\u8F91\u8D44\u6599\uFF0C\u907F\u514D\u6A21\u578B\u7F16\u9020\u5B66\u8005\u89C2\u70B9\u3002"), /*#__PURE__*/React.createElement("h2", {
    className: "mb-3 mt-7 text-lg",
    style: serif
  }, "\u5F53\u524D\u63A5\u5165\uFF1A\u4F60\u63D0\u4F9B\u7684\u6A21\u578B\u670D\u52A1"), /*#__PURE__*/React.createElement("a", {
    href: "https://platform.deepseek.com/api_keys",
    target: "_blank",
    rel: "noreferrer",
    className: "text-[#657f52] underline"
  }, "\u67E5\u770B\u5176\u4ED6\u517C\u5BB9\u6A21\u578B\u7684\u7533\u8BF7\u65B9\u5F0F \u2197"), /*#__PURE__*/React.createElement("p", {
    className: "mt-4"
  }, "\u5BC6\u94A5\u5DF2\u4FDD\u5B58\u5728\u672C\u673A\u540E\u7AEF\u7684 .env \u6587\u4EF6\uFF0C\u4E0D\u4F1A\u53D1\u9001\u5230\u6D4F\u89C8\u5668\u3002\u5F53\u524D\u4F7F\u7528\u4F60\u6307\u5B9A\u7684\u670D\u52A1\u5730\u5740\u4E0E gpt-5 \u6A21\u578B\uFF1B\u672C\u9875\u4E0D\u6536\u96C6\u5BC6\u94A5\u3002"), /*#__PURE__*/React.createElement("pre", {
    className: "my-4 overflow-auto rounded bg-[#eef2e5] p-4 text-xs leading-7"
  }, '密钥变量：SUPER_MIND_API_KEY（仅服务端）\n模型服务：https://space.ai-builders.com/backend/v1\n模型：gpt-5'), /*#__PURE__*/React.createElement("a", {
    href: "https://api-docs.deepseek.com/zh-cn/",
    target: "_blank",
    rel: "noreferrer",
    className: "text-xs underline"
  }, "\u5B98\u65B9\u63A5\u53E3\u4E0E\u6A21\u578B\u6587\u6863 \u2197"), /*#__PURE__*/React.createElement("p", {
    className: "mt-5 text-xs"
  }, live ? '主动使用AI时，会向你指定的服务商发送本轮原文、你的理解及必要对话上下文。' : '离线演示不调用模型、不上传输入。', " \u6240\u9009\u5B66\u8005\u8BFB\u6CD5\u4EC5\u4FDD\u5B58\u5728\u5F53\u524D\u6D4F\u89C8\u5668\uFF1B\u5BF9\u8BDD\u5237\u65B0\u540E\u4E0D\u4FDD\u7559\u3002"))), concept && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 flex items-end justify-center bg-[#25321f]/30 px-0 pt-10 sm:items-center sm:p-6",
    onMouseDown: e => {
      if (e.target === e.currentTarget) closeConcept();
    }
  }, /*#__PURE__*/React.createElement("section", {
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": "concept-title",
    onKeyDown: e => {
      if (e.key === 'Escape') closeConcept();
      if (e.key === 'Tab') {
        const controls = e.currentTarget.querySelectorAll('button,a[href]');
        const first = controls[0],
          last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    className: "max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-t-2xl border border-[#d7e1ca] bg-[#FBF8F1] p-6 sm:rounded-lg sm:p-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mb-4 flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[9px] tracking-widest text-[#9eab90]"
  }, "\u4E00\u4E2A\u6982\u5FF5\uFF0C\u4E0D\u53EA\u4E00\u79CD\u8BFB\u6CD5"), /*#__PURE__*/React.createElement("button", {
    ref: closeButton,
    onClick: closeConcept,
    "aria-label": "\u5173\u95ED\u6982\u5FF5\u5361\u7247",
    className: "p-2 text-xs text-[#8e9f7d]"
  }, "\u5173\u95ED \xD7")), /*#__PURE__*/React.createElement("h2", {
    id: "concept-title",
    className: "mb-4 text-3xl tracking-widest",
    style: serif
  }, concept.name), conceptLoading && /*#__PURE__*/React.createElement("p", {
    role: "status",
    className: "mb-3 text-xs text-[#93a281]"
  }, "\u8BFB\u53D6\u672C\u5730\u89C2\u70B9\u5361\u7247\u2026\u2026"), /*#__PURE__*/React.createElement("p", {
    className: "mb-4 text-sm leading-8 text-[#7a8d6b]"
  }, concept.plain), /*#__PURE__*/React.createElement("blockquote", {
    className: "mb-5 border-l-2 border-[#b1c39d] pl-4 text-base leading-8",
    style: serif
  }, CHAPTERS.quotes[concept.quoteKey], " ", /*#__PURE__*/React.createElement("small", {
    className: "block font-sans text-[10px] text-[#a6af9a]"
  }, "\u7528\u6237TXT \xB7 \u300A", concept.chapter, "\u300B")), /*#__PURE__*/React.createElement("p", {
    className: "mb-6 rounded bg-[#f3f0e5] p-3 text-xs leading-7 text-[#9b997e]"
  }, "\u8FB9\u754C\uFF1A", concept.boundary), /*#__PURE__*/React.createElement("div", {
    className: "grid gap-3 sm:grid-cols-2"
  }, concept.views.map(view => /*#__PURE__*/React.createElement("article", {
    key: view.id,
    className: 'rounded border p-4 ' + (terms[concept.id] === view.id ? 'border-[#9db78a] bg-[#eef4e5]' : 'border-[#e0e6d5] bg-[#fffdf8]')
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-2"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-base",
    style: serif
  }, view.name), /*#__PURE__*/React.createElement(Badge, null, view.era)), /*#__PURE__*/React.createElement("p", {
    className: "mt-3 text-xs leading-7 text-[#819373]"
  }, view.summary), /*#__PURE__*/React.createElement("p", {
    className: "mt-3 text-[10px] leading-6 text-[#9ba88d]"
  }, view.work, /*#__PURE__*/React.createElement("br", null), view.status), /*#__PURE__*/React.createElement(SourceLink, {
    id: view.source
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => selectView(concept, view),
    "aria-pressed": terms[concept.id] === view.id,
    className: "mt-4 block rounded border border-[#cfddc0] px-3 py-2 text-[10px] text-[#789262]"
  }, terms[concept.id] === view.id ? '✓ 暂取此说 · 可修改' : '暂取此说，带去读原文')))), concept.reception && /*#__PURE__*/React.createElement("div", {
    className: "mt-4 rounded border border-dashed border-[#d6dfca] p-4"
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "amber"
  }, "\u63A5\u53D7\u53F2\u7EBF\u7D22\uFF0C\u4E0D\u662F\u76F4\u63A5\u6CE8\u91CA"), /*#__PURE__*/React.createElement("h3", {
    className: "my-3 text-sm",
    style: serif
  }, concept.reception.name), /*#__PURE__*/React.createElement("p", {
    className: "mb-2 text-xs leading-7 text-[#8e9c7e]"
  }, concept.reception.summary), /*#__PURE__*/React.createElement(SourceLink, {
    id: concept.reception.source
  })), /*#__PURE__*/React.createElement("p", {
    className: "my-5 text-[10px] leading-7 text-[#a0ac93]"
  }, "\u8FD9\u4E9B\u8BFB\u6CD5\u7684\u7740\u529B\u70B9\u4E0D\u540C\uFF0C\u672A\u5FC5\u5F7C\u6B64\u5B8C\u5168\u6392\u65A5\u3002\u8BF7\u56DE\u5230\u5F15\u53E5\u548C\u5168\u7BC7\u68C0\u9A8C\uFF1B\u6682\u9009\u4E0D\u7B49\u4E8E\u5B66\u672F\u88C1\u51B3\u3002"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      const id = concept.chapter;
      closeConcept();
      openChapter(id);
    },
    className: "rounded bg-[#546d48] px-5 py-3 text-xs text-white"
  }, "\u5E26\u7740\u8BFB\u6CD5\uFF0C\u8BFB\u300A", concept.chapter, "\u300B \u2197"))), error && /*#__PURE__*/React.createElement("div", {
    role: "alert",
    className: "fixed bottom-4 left-1/2 z-[60] w-[90%] max-w-lg -translate-x-1/2 rounded border border-[#dacbb0] bg-[#fbf3e5] p-4 text-xs leading-7 text-[#9b8258]"
  }, error, /*#__PURE__*/React.createElement("button", {
    onClick: () => setError(''),
    className: "ml-4 underline"
  }, "\u5173\u95ED")), notice && /*#__PURE__*/React.createElement("div", {
    role: "status",
    className: "fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 rounded bg-[#556c49] p-4 text-xs text-white",
    onClick: () => setNotice('')
  }, notice), /*#__PURE__*/React.createElement("footer", {
    className: "mx-auto flex max-w-7xl flex-wrap justify-between gap-4 border-t border-[#dfe5d4] px-6 py-6 text-[10px] text-[#9ba88e] sm:px-10"
  }, /*#__PURE__*/React.createElement("span", {
    style: serif
  }, "\u6587\u8BBA\u4F34\u8BFB \xB7 \u4EBA\u6587\u7ECF\u5178\u4E09\u9636\u6BB5\u9605\u8BFB\u6CD5"), /*#__PURE__*/React.createElement("span", null, "\u5148\u642D\u811A\u624B\u67B6\uFF0C\u518D\u8FDB\u5165\u6587\u5B57\uFF0C\u6700\u540E\u5F62\u6210\u81EA\u5DF1\u7684\u95EE\u9898\u3002")));
}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(ContextDashboard));

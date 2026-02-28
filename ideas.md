# Multi-Market Live Monitor — 设计方案

## 方案一：Terminal Dark Pro
<response>
<idea>
**Design Movement**: 彭博终端 + 现代量化交易台风格
**Core Principles**:
1. 高密度信息展示，最大化数据可见性
2. 深色背景减少眼疲劳，适合长时间盯盘
3. 数据层级清晰，关键指标一眼可见
4. 专业感与可信度并存

**Color Philosophy**: 深空黑底（#0a0e1a）+ 电光蓝主色（#00d4ff）+ 绿涨红跌（#00ff88 / #ff4466），营造专业量化交易台的紧张感与精准感

**Layout Paradigm**: 左侧固定品种列表（240px），右侧主区域分上下两栏，上方行情快照横排卡片，下方K线图+副图+信号区三列布局

**Signature Elements**:
1. 数字字体使用等宽字体（JetBrains Mono），价格数字精准对齐
2. 信号强度用发光点（glow dot）表示，不同颜色对应不同强度
3. K线图边框用细线分隔，无圆角，硬朗专业

**Interaction Philosophy**: 悬停高亮行、点击即切换、无多余动画，一切以速度和效率为先

**Animation**: 价格变动时数字闪烁（0.2s），新信号弹窗从右下角滑入（0.3s），其余静态

**Typography System**: JetBrains Mono（数字/代码）+ IBM Plex Sans（标签/说明），严格的字号层级：12/14/16/20/28px
</idea>
<text>Terminal Dark Pro</text>
<probability>0.08</probability>
</response>

## 方案二：Obsidian Dashboard
<response>
<idea>
**Design Movement**: 极简主义 + 玻璃拟态（Glassmorphism）
**Core Principles**:
1. 半透明卡片叠加深色渐变背景，营造深度感
2. 信息密度适中，留白充足，减少认知负担
3. 颜色作为信号语言，而非装饰
4. 圆角卡片 + 微妙阴影，现代科技感

**Color Philosophy**: 深蓝渐变背景（#0f1729 → #1a2744）+ 白色/浅灰文字 + 青绿主色（#38bdf8），玻璃卡片用 rgba(255,255,255,0.05) 背景

**Layout Paradigm**: 顶部导航栏（市场切换），左侧品种列表，右侧主区域全宽展示，响应式网格

**Signature Elements**:
1. 玻璃卡片（backdrop-blur + 半透明边框）
2. 渐变文字用于标题和关键数值
3. 信号时间线用竖线连接，时间轴设计

**Interaction Philosophy**: 流畅过渡，hover时卡片轻微上浮，聚焦时边框发光

**Animation**: 卡片进入时 fade+slide（0.4s），数值变化时 count-up 动画，图表加载时骨架屏

**Typography System**: Space Grotesk（标题）+ Inter（正文）+ JetBrains Mono（数字），字号层级：11/13/15/18/24/32px
</idea>
<text>Obsidian Dashboard</text>
<probability>0.07</probability>
</response>

## 方案三：Quant Terminal — 选定方案
<response>
<idea>
**Design Movement**: 专业量化终端 + 新拟物主义（Neumorphism lite）
**Core Principles**:
1. 深色底（#080d1a）+ 微妙纹理，减少视觉疲劳
2. 数据密度极高但层次分明，通过字重和颜色区分层级
3. 功能区块用细线分隔，无多余装饰
4. 绿涨红跌 + 蓝色信号 + 橙色警告，颜色即语义

**Color Philosophy**: 深海蓝黑底（#060b18）+ 冷白文字（#e8edf5）+ 青蓝主色（#0ea5e9）+ 翠绿涨（#22c55e）+ 玫红跌（#ef4444）+ 琥珀警告（#f59e0b），整体冷色调，专业克制

**Layout Paradigm**: 固定左侧导航（市场切换，60px icon-only）+ 可折叠品种列表（220px）+ 主内容区（flex-grow），顶部状态栏（40px），非居中非对称布局

**Signature Elements**:
1. 价格数字用 tabular-nums 等宽字体，涨跌用颜色+箭头双重编码
2. 中枢矩形用半透明填充（rgba蓝色），三买标记用发光圆点
3. 信号强度条（细长进度条）而非星级，更精确

**Interaction Philosophy**: 零延迟切换，hover时行背景微亮，信号弹窗不遮挡图表

**Animation**: 价格更新时背景色短暂闪烁（绿/红，0.3s），新信号从右侧滑入（0.25s），K线图数据加载时渐显

**Typography System**: Space Grotesk（UI标签）+ JetBrains Mono（所有数字/价格/时间）+ Noto Sans SC（中文），字号：11/12/13/14/16/20/24px
</idea>
<text>Quant Terminal — 深海蓝黑专业量化终端风格</text>
<probability>0.09</probability>
</response>

---

## 选定方案：Quant Terminal

采用**深海蓝黑专业量化终端**风格：
- 深色底（#060b18）减少长时间盯盘疲劳
- 严格的颜色语义：青蓝=主色/信号，翠绿=涨/买，玫红=跌/卖，琥珀=警告
- 等宽字体确保数字对齐，提升专业感
- 非对称布局：左侧导航栏+品种列表，右侧主内容区
- 缠论中枢用半透明矩形可视化，三买点用发光标记

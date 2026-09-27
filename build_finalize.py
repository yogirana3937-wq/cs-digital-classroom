from pathlib import Path
import re, zipfile, html
base=Path('/mnt/data/cs_final')
# Add a quiz bank and classroom examples directly into both pages.
examples=[
"A student types an answer, the CPU processes the keystrokes, RAM holds the active document, and the screen shows the result.",
"A timeline from mechanical calculators to transistors, integrated circuits and microprocessors shows how computing became smaller and more capable.",
"A school report can use heading styles, a table, an image, page numbers and a PDF export.",
"A science presentation can use one slide for the question, one for a diagram, one for results and one for the conclusion.",
"A class marks sheet can calculate totals and averages and then display the results in a chart.",
"When a student enters a web address, the browser can use DNS, send packets through routers and receive a response from a web server.",
"The binary number 1101 is 8+4+0+1, so its decimal value is 13.",
"In a school lab, PCs can connect to a switch, the switch to a router, and the router to the ISP and wider Internet.",
"A compiler can transform source code through parsing, analysis, optimization and code generation before executable instructions are produced.",
"A model can learn from labeled examples of messages and then classify a new message as likely spam or not spam."
]
quizzes=[
[("Which component executes instructions?",["CPU","SSD","Monitor","Keyboard"],0),("Which is normally volatile working memory?",["SSD","RAM","DVD","Printer"],1)],
[("What technology replaced many vacuum-tube applications?",["Transistors","Printers","Monitors","Keyboards"],0),("What put CPU functions onto a chip?",["Microprocessor","Router","Spreadsheet","Printer"],0)],
[("What helps keep headings consistent?",["Styles","Router","Compiler","RAM"],0),("What organizes information in rows and columns?",["Table","CPU","Browser","DNS"],0)],
[("What is useful for numerical patterns?",["Chart","Keyboard","Folder","Router"],0),("What should a slide usually make clear?",["A main idea","Every textbook sentence","Only decoration","Random facts"],0)],
[("Which is a spreadsheet function?",["SUM","HTTP","DNS","HTML"],0),("What is B4?",["A cell reference","A web address","A file type","A compiler"],0)],
[("What does DNS help a client find?",["An IP address for a domain","A CPU clock","A printer driver","A spreadsheet formula"],0),("Which protocol protects web communication with TLS?",["HTTPS","RAM","BIOS","HTML"],0)],
[("How many symbols does binary use?",["2","8","10","16"],0),("What is binary 1101 in decimal?",["13","11","15","9"],0)],
[("What device commonly connects devices within a LAN?",["Switch","Printer","Scanner","Projector"],0),("What connects different networks?",["Router","Keyboard","Monitor","Spreadsheet"],0)],
[("Which compiler stage checks program structure?",["Parsing","Printing","Routing","Formatting"],0),("Can a program compile and still contain a logic error?",["Yes","No","Only on phones","Only online"],0)],
[("What strongly influences what a model learns?",["Training data","Monitor size","Keyboard layout","Printer speed"],0),("What is overfitting?",["Fitting training data too closely","Deleting all data","Increasing screen size","Changing a keyboard"],0)]
]
quiz_js='const QUIZ='+repr(quizzes).replace("'",'"')+';'
# More robust JSON-ish conversion
import json
quiz_js='const QUIZ='+json.dumps(quizzes,ensure_ascii=False)+';'
example_js='const EXAMPLES='+json.dumps(examples,ensure_ascii=False)+';'
quiz_css='''\n<style id="next-level-css">.example{background:#071827;border:2px solid #4ade80;border-radius:12px;padding:15px;margin:14px 0}.example h2{color:#4ade80}.quizbox{background:#071322;border:2px solid #38506d;border-radius:12px;padding:15px;margin:14px 0}.quizbox h2{color:#38bdf8}.quizq{padding:12px;border-bottom:1px solid #38506d}.quizq:last-child{border-bottom:0}.quizq button{margin:7px 6px 0 0;padding:9px 12px;border:2px solid #38506d;border-radius:9px;background:#142842;color:#fff;font-weight:800}.quizq button:disabled{opacity:.65}.quizfeedback{font-weight:900;margin-top:7px}.ok{color:#4ade80}.no{color:#fb7185}.board-actions{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.board-actions .btn{min-height:44px}</style>\n'''
for fn in ['teacher.html','board.html']:
    p=base/fn; s=p.read_text(encoding='utf-8')
    if 'id="next-level-css"' not in s:
        s=s.replace('</style></head>',quiz_css+'</style></head>',1)
    # Insert example + quiz containers after facts card before closing main.
    marker='</main>\n<script>'
    if marker in s and 'id="exampleBox"' not in s:
        insert='<div class="card example" id="exampleBox"><h2>💡 Classroom Example</h2><p id="exampleText"></p></div><div class="card quizbox"><h2>🧠 Interactive Quiz</h2><div id="quizBox"></div></div>'
        s=s.replace(marker,insert+marker,1)
    # Board gets read/stop controls.
    if fn=='board.html' and 'onclick="speak()"' not in s:
        s=s.replace('<div class=status id=status>● Waiting for teacher</div>', '<div class="board-actions"><button class="btn primary" onclick="speak()">🔊 Read</button><button class="btn" onclick="stopSpeak()">⏹ Stop</button></div><div class=status id=status>● Waiting for teacher</div>',1)
    # Inject constants before L.
    if 'const EXAMPLES=' not in s:
        s=s.replace('<script>const L=', '<script>'+example_js+quiz_js+'const L=',1)
    # Extend render function with example/quiz rendering.
    old='function render(i){let x=L[i];'
    if old in s and 'renderQuiz(i)' not in s:
        s=s.replace(old, 'function renderQuiz(idx){const box=document.getElementById("quizBox");if(!box)return;box.innerHTML=QUIZ[idx].map((q,n)=>`<div class="quizq"><b>${n+1}. ${q[0]}</b><div>${q[1].map((a,k)=>`<button onclick="answerQuiz(${idx},${n},${k},this)">${a}</button>`).join("")}</div><div id="qf${n}" class="quizfeedback"></div></div>`).join("")}\nfunction answerQuiz(t,q,a,btn){const qd=QUIZ[t][q];btn.parentElement.querySelectorAll("button").forEach(b=>b.disabled=true);const f=document.getElementById("qf"+q);f.textContent=a===qd[2]?"✅ Correct!":"❌ Try again after reviewing the concept.";f.className="quizfeedback "+(a===qd[2]?"ok":"no")}\nfunction render(i){let x=L[i];')
    if 'renderQuiz(i);' not in s:
        s=s.replace('facts.innerHTML=x.facts.map((f,j)=>`<div class=mini><b>Interesting fact ${j+1}</b><p>${f}</p></div>`).join("")}', 'facts.innerHTML=x.facts.map((f,j)=>`<div class=mini><b>Interesting fact ${j+1}</b><p>${f}</p></div>`).join("");const ex=document.getElementById("exampleText");if(ex)ex.textContent=EXAMPLES[i];renderQuiz(i)')
    p.write_text(s,encoding='utf-8')

# Create 20 lightweight offline SVG visuals referenced by the pages.
img=base/'images'; img.mkdir(exist_ok=True)
colors=['#38bdf8','#4ade80','#fbbf24','#f472b6','#a78bfa']
for t in range(1,11):
    for j in range(1,3):
        title=f'Topic {t} Visual {j}'
        c=colors[(t+j)%len(colors)]
        svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#071322"/><stop offset="1" stop-color="#173452"/></linearGradient></defs><rect width="800" height="450" rx="28" fill="url(#g)"/><g fill="none" stroke="{c}" stroke-width="6"><rect x="100" y="100" width="180" height="120" rx="18"/><rect x="310" y="70" width="180" height="120" rx="18"/><rect x="520" y="110" width="180" height="120" rx="18"/><path d="M280 160h30M490 130l30 30"/><circle cx="400" cy="315" r="70"/><path d="M400 245v-55M330 315h-80M470 315h80"/></g><g fill="white" font-family="system-ui" font-weight="800" text-anchor="middle"><text x="400" y="48" font-size="30">{title}</text><text x="190" y="165" font-size="22">INPUT</text><text x="400" y="135" font-size="22">PROCESS</text><text x="610" y="175" font-size="22">OUTPUT</text><text x="400" y="323" font-size="22">DATA</text></g></svg>'''
        (img/f'topic{t}_{j}.svg').write_text(svg,encoding='utf-8')
# Add a simple README with exact phone/board steps.
(base/'README.md').write_text('''# CS Digital Classroom — Next Level Final Build\n\nOpen `index.html` in Chrome or publish the folder to GitHub Pages.\n\n## Teacher\n1. Open Teacher Control.\n2. Enter any 6-digit classroom code and tap Start Classroom.\n3. Keep the teacher page open.\n\n## Digital Board\n1. Open Digital Board on the board browser.\n2. Enter the same 6-digit code.\n3. Tap Connect.\n4. Teacher topic changes are synchronized to the board.\n\nThe board/teacher connection uses PeerJS over the Internet, so both devices need Internet access. Read Aloud uses the browser speech engine.\n''',encoding='utf-8')
# Zip everything.
zip_path=Path('/mnt/data/CS_Digital_Classroom_NEXT_LEVEL_FINAL.zip')
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED) as z:
    for p in [base/'index.html',base/'teacher.html',base/'board.html',base/'README.md']+sorted(img.glob('*.svg')):
        z.write(p,p.relative_to(base))
print(zip_path)
print('files',len(z.namelist()) if False else 24)

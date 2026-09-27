# CS Digital Classroom — Teaching Studio

Open `index.html` to enter the Teacher or Board page. To publish, upload **all files and the `assets/` folder** to the same GitHub Pages repository directory. Open Teacher on one device and Board on the classroom display. Start Teacher with a six-digit code, then connect the Board using that code. Student phones are not used.

## Classroom workflow

The Teacher page controls the topic and the Board mirrors it. Detailed teaching notes appear directly below the 3D Lab on both pages; their Explore in 3D buttons return to the related model. Open the collapsible Teaching Studio at the bottom of the lesson (or use the Teacher page shortcut near the top):

1. **Explain:** Set a goal and use the guided 3D tour to highlight a component and hear/read its explanation.
2. **Predict:** Ask students to order the parts in Build the Model, then pose a What if? or Spot the Mistake challenge.
3. **Demonstrate:** Step through a four-part process and show a side-by-side comparison.
4. **Check:** Use Concept Check, a show-of-hands tally, and an Exit Question.

The Teacher controls **Present tour / step / build / compare / exit / recap / mistake / check** to fill the Board with that part of the lesson. **Close presentation** restores the regular Board. Every topic has a teacher preparation card with an objective, likely misconception, materials, and suggested 15-minute pacing. The teacher can adjust text size, contrast, and motion; settings synchronize with the Board.

## Content and images

There are 10 topics, 50 switchable 3D views, approximately 100 note-linked concepts, 20 topic diagrams, topic simulations and dated reference panels. The gallery includes 10 bundled source images: real hardware photos, authentic application screenshots, or published schematics for abstract concepts. Every teaching note also has its own labeled concept diagram and an Explore in 3D action. Photos are teaching examples, not literal pictures of every abstract concept. The source and license page for each image is linked beside it.

The Internet has no single discovery date: the gallery distinguishes the 1969 ARPANET message, work toward TCP/IP in 1973, ARPANET's 1983 TCP/IP transition, and the 1989 World Wide Web proposal. The Web is a service built on the Internet. RAM types and milestones for FORTRAN, COBOL, BASIC, C, Python, Java, and JavaScript are also covered. Each dated reference links to its historical source.

## Offline use and limitations

Lessons, diagrams, simulations, image assets, and teacher controls work locally. When served over HTTPS (including GitHub Pages), a service worker caches the core pages and bundled images after a successful online visit; reload once while online before relying on the cache. The Teacher and Board **cannot pair or synchronize without Internet** because the current connection uses an external peer service. When waiting for Teacher or after its signal is lost, the Board itself provides Previous/Next Topic and Previous/Next Concept controls. Tap Next Concept to open that note in the 3D model with its written explanation. When the teacher reconnects, the board returns to the teacher-controlled lesson. Speech playback depends on browser support; written explanations remain available. Opening files directly from a ZIP or `file://` does not install the service worker.

For reliable updates, replace the entire project directory, then refresh Teacher and Board after deployment. If the older service worker has cached a page, reload once online to retrieve the new version.

## Bundled source images

Each source page contains its author and reuse terms. The project links to these pages in the gallery: Wikimedia Commons `Xbox-Motherboard-Rev1.jpg`, `Classic shot of the ENIAC.jpg`, `Libreoffice-writer.png`, `Libreoffice-impress.png`, `Libreoffice-calc.png`, `First Web Server.jpg`, `Logic-gate-and-us.svg`, `1969 ARPANET BBN IMP.jpg`, `Python code example.png`, and `Neural Network.svg`.

## If the live site still shows Teaching Studio above the 3D Lab

The page is still using older deployed files. Replace the complete GitHub Pages project, keeping `index.html`, `teacher.html`, `board.html`, `studio.js`, `studio.css`, `references.js`, `references.css`, `offline.js`, `sw.js`, and `assets/` together. Wait for Pages to publish; reload the Teacher and Board pages online. The updated Teacher page shows a **Teaching Studio ↓** shortcut near the topic navigation and a closed **Teaching Studio · tap to expand or collapse** section after the quiz. The detailed notes sit immediately under the 3D Lab. If the old layout persists, close that tab and open the site in a fresh browser tab to bypass a stale tab view.

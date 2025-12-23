# All-in-One Data Structure Mini Apps

Four small front-end exercises live in this single folder, each answering one question with its own HTML/CSS/JS file. Open `index.html` to land on the hub and jump to any page; every page also has a Home button in the navbar.

## How each page works


- **Contact Manager (Map):** Uses a `Map` for add/search/delete. Contacts persist in `localStorage` as `[name, phone]` entries. Search and edit operate on the map; deleting updates storage immediately.


- **Task Scheduler (Queue):** Keeps tasks in an array used as a FIFO queue (`push` to enqueue, `shift` to process next). Progress and completion text are shown with simple UI states. The queue is saved in `localStorage`.


- **Undo / Redo (Two stacks):** Maintains `actionsStack` and `redoStack`. Adding pushes to `actionsStack` and clears `redoStack`; undo pops from actions and pushes to redo; redo pops from redo back to actions. Autosaves the pair to `localStorage`—no database or MongoDB required.


- **Unique Visitor Tracker (Set):** A `Set` guarantees uniqueness. Attempts to re-add an existing visitor increment a duplicate counter. Data persists to `localStorage`.



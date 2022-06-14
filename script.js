const dropDivs = document.getElementsByClassName('dropdown__droppable'),
    triggers = document.getElementsByClassName('dropdown__trigger')

for (const trigger of triggers) {
    trigger.addEventListener('click', (e) => {
        const droppable = e.target.parentElement.lastElementChild
        if (droppable.className == "dropdown__droppable") {
            droppable.className += " dropdown__droppable--dropped"
        } else if (droppable.className == "dropdown__droppable dropdown__droppable--dropped") {
            droppable.className = "dropdown__droppable"
        } else {
            console.log(droppable.className)
        }
    }, true)
}

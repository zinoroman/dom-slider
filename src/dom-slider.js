import './dom-slider.css';

function slide(element, slideSpeed, direction, easing, delay) {
    // prevent user from sliding down if already sliding
    if(direction === 'down'
        && (
            [...element.classList].some(e => new RegExp(/setHeight/).test(e))
            || !element.classList.contains('DOM-slider-hidden')
        )
    ) return Promise.resolve()

    // prevent user from sliding up if already sliding
    if(direction === 'up'
        && (
            element.classList.contains('DOM-slider-hidden')
            || [...element.classList].some(e => new RegExp(/setHeight/).test(e))
        )
    ) return Promise.resolve()

    const s = element.style
    const speed = (slideSpeed) ? slideSpeed : (slideSpeed === 0) ? 0 : 300
    let contentHeight = element.scrollHeight

    // subtract padding from contentHeight
    if(direction === 'up') {
        const style = window.getComputedStyle(element)
        const paddingTop = +style.getPropertyValue('padding-top').split('px')[0]
        const paddingBottom = +style.getPropertyValue('padding-bottom').split('px')[0]
        contentHeight = element.scrollHeight - paddingTop - paddingBottom
    }

    // create a setHeight CSS class
    const sheet = document.createElement('style')
    // create an id for each class to allow multiple elements to slide
    // at the same time, such as when activated by a forEach loop
    const setHeightId = (Date.now() * Math.random()).toFixed(0)
    sheet.innerHTML = `.setHeight-${setHeightId} {height: ${contentHeight}px;}`
    document.head.appendChild(sheet)

    // add the CSS classes that will give the computer a fixed starting point
    if(direction === 'up') {
        element.classList.add(`setHeight-${setHeightId}`)
    }
    else {
        element.classList.add('DOM-slider-hidden', `setHeight-${setHeightId}`)
    }

    s.transition = `all ${speed}ms ${easing || ''}`
    s.overflow = 'hidden'

    // add/remove the CSS class(s) that will animate the element
    function animate() {
        return new Promise(function (resolve, reject) {
            if (direction === 'up') {
                // Don't know why, but waiting 10 milliseconds before adding
                // the 'hidden' class when sliding up prevents height-jumping
                setTimeout(function () {
                    element.classList.add('DOM-slider-hidden')
                    resolve()
                }, delay ? +delay + 10 : 10)
            }
            else {
                setTimeout(function () {
                    element.classList.remove('DOM-slider-hidden')
                    resolve()
                }, delay ? +delay + 10 : 10)
            }
        })
    }

    return animate()
        .then(function () {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    // remove the temporary inline styles and remove the temp stylesheet
                    element.removeAttribute('style')
                    sheet.parentNode.removeChild(sheet)
                    element.classList.remove(`setHeight-${setHeightId}`)
                    resolve(element)
                }, speed)
            })
        })

    let done = new Promise(function(resolve, reject) {
        setTimeout(function() {
            // remove the temporary inline styles and remove the temp stylesheet
            element.removeAttribute('style')
            sheet.parentNode.removeChild(sheet)
            element.classList.remove(`setHeight-${setHeightId}`)
            resolve(element)
        }, speed)
    })

    return done
}

export const slideDown = function (element, speed, easing, delay) {
    return slide(element, speed, 'down', easing, delay)
}

export const slideUp = function(element, speed, easing, delay) {
    return slide(element, speed, 'up', easing, delay)
}

export const slideToggle = function(element, speed, easing, delay) {
    if(element.classList.contains('DOM-slider-hidden')) {
        return slide(element, speed, 'down', easing, delay)
    }
    else {
        return slide(element, speed, 'up', easing, delay)
    }
}

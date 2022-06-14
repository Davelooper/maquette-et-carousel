class Carousel {

	/**
	* @param {HTMLElement} element
	* @param {String} name of created carousel
	* @param {Object} options
	* @param {Object} [options.slidesToScroll=1] Number of elements who scroll on carousel.
	* @param {Object} [options.slidesVisible=1] Number of elements who are visible on one slide.
	* @param {boolean} [options.loop=false] Specifies if we get back to the first slide at the end of the carousel.
	* @param {boolean} [options.pagination=false]
	* @param {Object||null} [options.imagesNavigation=null] Specifies the images of navigation buttons.
	* @param {boolean} [options.navigation=true]
	* @param {boolean||number} [options.autoScroll=false] If it's activated, set the time (ms) between scrolls. 
	*/
	constructor(element, name, options = {}) {
		this.element = element
		this.name = name
		this.options = Object.assign({}, {
				slidesToScroll: 1,
				slidesVisible: 1,
				loop: false,
				navigation: true,
				pagination: false,
				autoScroll: false,
				imagesNavigation: null,
			}, options)
		this.container = this.createDivWithClass('carousel-' + this.name + '__container')
		this.root = this.createDivWithClass('carousel-' + this.name)
		this.currentItem = 0
		this.moveCallbacks = []
		this.isMobile = true
		let children = [].slice.call(element.children)

		//DOM modifications
		this.root.appendChild(this.container)
		this.root.setAttribute('tabIndex', '0')
		this.element.appendChild(this.root)
		this.items = children.map( child => {
			let item = this.createDivWithClass('carousel-' + this.name + '__item');
			item.appendChild(child)
			this.container.appendChild(item)
			return item
		})
		this.setStyle()
		if (this.options.navigation) {
			this.createNavigation()	
		}
		if (this.options.pagination) {
			this.createPagination()
		}
		if (this.options.autoScroll) {
			this.autoScroll();
		}

		//Events
		this.moveCallbacks.forEach(cb => cb(0))
		this.onWindowResize()
		window.addEventListener('resize', this.onWindowResize.bind(this))
		this.root.addEventListener('keyup', e => {
			if (e.key === 'ArrowRight') {
				this.next()
			} else if (e.key === 'ArrowLeft') {
				this.prev()
			}
		} )
	}

	/**
	* @returns {number} 
	*/
	get slidesToScroll () {
		return this.isMobile ? 1 : this.options.slidesToScroll
	}

	/**
	* @returns {number} 
	*/
	get slidesVisible () {
		return this.isMobile ? 1 : this.options.slidesVisible
	}

	/**
	* @param {string} className
	* @returns {HTMLElement}
	*/
	createDivWithClass (className) {
		let div = document.createElement('div')
		div.setAttribute('class', className)
		return div
	}

	/**
	* Create navigation's buttons.
	*/
	createNavigation () {
		let nextButton = this.createDivWithClass('carousel-' + this.name + '__next')
		let prevButton = this.createDivWithClass('carousel-' + this.name + '__prev')

		if (this.options.imagesNavigation) {
			console.log(this.options.imagesNavigation.prev, "plop")
			if (this.options.imagesNavigation.prev && this.options.imagesNavigation.next) {
				let imagePrevButton = document.createElement('img')
				let imageNextButton = document.createElement('img')

				imagePrevButton.setAttribute("src", this.options.imagesNavigation.prev)
				imagePrevButton.setAttribute("alt", "A pagination image")
				imagePrevButton.classList.add("carousel-" + this.name + "__prev-image")
				prevButton.appendChild(imagePrevButton)

				imageNextButton.setAttribute("src", this.options.imagesNavigation.next)
				imageNextButton.setAttribute("alt", "A pagination image")
				imageNextButton.classList.add("carousel-" + this.name + "__next-image")
				nextButton.appendChild(imageNextButton)
			}
		}
		this.root.appendChild(nextButton)
		this.root.appendChild(prevButton)
		nextButton.addEventListener('click', this.next.bind(this))
		prevButton.addEventListener('click', this.prev.bind(this))
		if (this.options.loop) {
			return
		}
		this.onMove(index => {
			if (index === 0) {
				prevButton.classList.add('carousel-' + this.name + '__prev--hidden')
			} else {
				prevButton.classList.remove('carousel-' + this.name + '__prev--hidden')
			}
			if (this.items[this.currentItem + this.slidesVisible] === undefined) {
				nextButton.classList.add('carousel-' + this.name + '__next--hidden')
			} else {
				nextButton.classList.remove('carousel-' + this.name + '__next--hidden')
			}
		})
	}

	/**
	* Create pagination's button
	*/
	createPagination () {
		let pagination = this.createDivWithClass('carousel-' + this.name + '__pagination')
		let buttons = []
		this.root.appendChild(pagination)
		for (let i = 0; i < this.items.length; i = i + this.options.slidesToScroll) {
			let button = this.createDivWithClass('carousel-' + this.name + '__pagination-button')
			button.addEventListener('click', () => this.goToItem(i))
			pagination.appendChild(button)
			buttons.push(button)
		}
		this.onMove(index => {
			let activeButton = buttons[Math.floor(index / this.options.slidesToScroll)]
			if (activeButton) {
				buttons.forEach(button => button.classList.remove('carousel-' + this.name + '__pagination-button--active'))
				activeButton.classList.add('carousel-' + this.name + '__pagination-button--active')
			}
		})
	}

	/**
	* Set appropriates dimensions to carousel's elements.
	*
	*/
	setStyle () {
		let ratio = this.items.length / this.slidesVisible
		this.container.style.width = (ratio * 100) + "%"
		this.items.forEach(item => item.style.width = ((100 / this.slidesVisible) / ratio ) + "%")
	}

	/**
	* Move the carousel towards the target element.
	* @param (number)
	*/
	goToItem (index) {
		if (index < 0) {
			if (this.options.loop) {
				index = this.items.length - this.slidesVisible;
			} else {
				return
			}
		} else if (index >= this.items.length || 
					(this.items[this.currentItem + this.slidesVisible === undefined] &&
					index > this.currentItem)) {
			if (this.options.loop) {
				index = 0
			} else {
				return
			}
		}
		let translateX = index * -100 / this.items.length
		this.container.style.transform = 'translate3d(' + translateX + '%, 0, 0)'
		this.currentItem = index
		this.moveCallbacks.forEach( cb => cb(index))
	}

	/**
	* Move the carousel on the next slide
	*/
	next () {
		this.goToItem( this.currentItem + this.slidesToScroll)
	}

	/**
	* Move the carousel on the precedent slide.
	*/
	prev () {
		this.goToItem( this.currentItem - this.slidesToScroll)
	}

	/**
	* Activate the auto-scroll with appropriates intervals.
	*/
	autoScroll() {
		this.next()
		setTimeout(() => this.autoScroll(), this.options.autoScroll)
	}
	

	onMove (cb) {
		this.moveCallbacks.push(cb)
	}

	/**
	* Activate the mode mobile if the screen is less than 768px.
	*/
	onWindowResize () {
		let mobile = window.innerWidth < 768 
		if (mobile !== this.isMobile ||
			(mobile  && this.isMobile)) {
			this.isMobile = mobile
			this.setStyle()
			this.moveCallbacks.forEach(cb => cb(this.currentItem))
		}
	}
	
}
new Carousel(document.querySelector('.carousel'), 'home', {pagination: true, imagesNavigation: {
	next: "assets/2.png",
	prev: "assets/2.png"
	}
 })



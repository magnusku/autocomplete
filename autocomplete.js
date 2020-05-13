(() => {

    const template = document.createElement('template');
    template.innerHTML = `
        <style>
            label {
                display: block;
            }

            div:not(.item) {
                border: 1px solid #ddd;
            }

            div.item {
                text-align: center;
                background-color: #fff;
            }
            div.item:nth-child(2) {
                background-color: #eee;
            }

            div.item:hover {
                background: green;
            }
        </style>

        <form>
            <label for="input">title:</label>
            <input id="input"/>
            <div id="ul"></div>
        </form>
    `;

    window.customElements.define('ua-autocomplete', 

    class AutoComplete extends HTMLElement {
        
        static get observedAttributes() {
            return ['title', 'placeholder'];
        }
        
        attributeChangedCallback(name, oldValue, newValue) {
            if(oldValue !== newValue) {
                this.applyAttributes();
            }
        }
        
        constructor() {
            super();
            
            this.attachShadow({mode: 'open'});
            this.shadowRoot.appendChild(template.content.cloneNode(true));
            this.list = [];
            
            this.form = this.shadowRoot.querySelector('form');
            this.input = this.shadowRoot.querySelector('input');
            this.ul = this.shadowRoot.querySelector('#ul');
        }
        
        connectedCallback() {
            this.addInputEventListener();
            this.addClickEventListener();

            this.doRequest();
        }


        addClickEventListener() {
            this.ul.addEventListener('click', (event) => {
                if(event.target && event.target.classList.contains('item')) {
                    this.input.value = event.target.innerText;
                    this.clearList();
                }
            });
        }

        addInputEventListener() {
            this.input.addEventListener('input', (e) => {
                this.clearList();

                if(e.target.value.length > 0) {
                    this.list
                        .filter(item => String(item).toLowerCase().indexOf(e.target.value.toLowerCase()) > -1)
                        .map(item => {
                            console.log(item);
                            let li = document.createElement('div');
                            li.classList.add('item')
                            li.innerText = item;
                            return li;
                        }).forEach(listItem => {
                            this.ul.appendChild(listItem);
                        });
                }
            });
        }

        doRequest() {
            const request = new XMLHttpRequest();
            
            request.open('GET', this.getAttribute('url'), true);
            request.onload = () => {
                const STATUS_OK = request.status >= 200 && request.status < 300;
                if(STATUS_OK) {
                    this.list = JSON.parse(request.responseText);
                }
            }

            request.send();
        }

        applyAttributes() {
            if (this.hasAttribute('title')) {
                this.shadowRoot.querySelector('label').innerText = this.getAttribute('title');
            }
            if (this.hasAttribute('placeholder')) {
                this.shadowRoot.querySelector('input').setAttribute('placeholder', this.getAttribute('placeholder'));
            }
        }

        clearList() {
            let child = this.ul.lastChild;            
            while(child) {
                this.ul.removeChild(this.ul.firstChild);
                child = this.ul.lastChild;
            }
        }
    });

})();
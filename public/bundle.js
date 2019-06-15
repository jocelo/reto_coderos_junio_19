
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.shift()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            while (render_callbacks.length) {
                const callback = render_callbacks.pop();
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_render);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_render.forEach(add_render_callback);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_render } = component.$$;
        fragment.m(target, anchor);
        // onMount happens after the initial afterUpdate. Because
        // afterUpdate callbacks happen in reverse order (inner first)
        // we schedule onMount callbacks before afterUpdate callbacks
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_render.forEach(add_render_callback);
    }
    function destroy(component, detaching) {
        if (component.$$) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_render: [],
            after_render: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_render);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro && component.$$.fragment.i)
                component.$$.fragment.i();
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy(this, true);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (!stop) {
                    return; // not ready
                }
                subscribers.forEach((s) => s[1]());
                subscribers.forEach((s) => s[0](value));
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                }
            };
        }
        return { set, update, subscribe };
    }

    const storeCardNumber = writable('');
    const storeCardName = writable('');
    const storeCardDates = writable('');

    /* src/Card.svelte generated by Svelte v3.5.1 */

    const file = "src/Card.svelte";

    // (143:6) { #if card.imageSrc !== '' }
    function create_if_block_1(ctx) {
    	var div, img, img_src_value;

    	return {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			img.alt = "Loading main image";
    			img.src = img_src_value = ctx.card.imageSrc;
    			img.className = "";
    			add_location(img, file, 144, 8, 3584);
    			div.className = "brand-icon svelte-k5k4n2";
    			add_location(div, file, 143, 6, 3549);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, img);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.card) && img_src_value !== (img_src_value = ctx.card.imageSrc)) {
    				img.src = img_src_value;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    // (151:6) { #if card.dates !== '' }
    function create_if_block(ctx) {
    	var div1, t0, div0, t1_value = ctx.card.dates, t1;

    	return {
    		c: function create() {
    			div1 = element("div");
    			t0 = text("Good through: ");
    			div0 = element("div");
    			t1 = text(t1_value);
    			div0.className = "svelte-k5k4n2";
    			add_location(div0, file, 151, 44, 3850);
    			div1.className = "card-dates svelte-k5k4n2";
    			add_location(div1, file, 151, 6, 3812);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, t0);
    			append(div1, div0);
    			append(div0, t1);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.card) && t1_value !== (t1_value = ctx.card.dates)) {
    				set_data(t1, t1_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}
    		}
    	};
    }

    function create_fragment(ctx) {
    	var div6, div5, div1, div0, img, t0, t1, div4, div2, t2_value = ctx.card.number, t2, t3, t4, div3, t5_value = ctx.card.name, t5, div5_class_value;

    	var if_block0 = (ctx.card.imageSrc !== '') && create_if_block_1(ctx);

    	var if_block1 = (ctx.card.dates !== '') && create_if_block(ctx);

    	return {
    		c: function create() {
    			div6 = element("div");
    			div5 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div4 = element("div");
    			div2 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			div3 = element("div");
    			t5 = text(t5_value);
    			img.src = ctx.chipImage;
    			img.alt = "default chip image";
    			img.className = "chip-card svelte-k5k4n2";
    			add_location(img, file, 141, 25, 3434);
    			div0.className = "chip svelte-k5k4n2";
    			add_location(div0, file, 141, 6, 3415);
    			div1.className = "upper-section svelte-k5k4n2";
    			add_location(div1, file, 140, 4, 3380);
    			div2.className = "card-number svelte-k5k4n2";
    			add_location(div2, file, 149, 6, 3727);
    			div3.className = "card-name svelte-k5k4n2";
    			add_location(div3, file, 153, 6, 3903);
    			div4.className = "bottom-section svelte-k5k4n2";
    			add_location(div4, file, 148, 4, 3691);
    			div5.className = div5_class_value = "card " + ctx.card.type + " svelte-k5k4n2";
    			add_location(div5, file, 139, 2, 3344);
    			div6.className = "card-container svelte-k5k4n2";
    			add_location(div6, file, 138, 0, 3312);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div6, anchor);
    			append(div6, div5);
    			append(div5, div1);
    			append(div1, div0);
    			append(div0, img);
    			append(div1, t0);
    			if (if_block0) if_block0.m(div1, null);
    			append(div5, t1);
    			append(div5, div4);
    			append(div4, div2);
    			append(div2, t2);
    			append(div4, t3);
    			if (if_block1) if_block1.m(div4, null);
    			append(div4, t4);
    			append(div4, div3);
    			append(div3, t5);
    		},

    		p: function update(changed, ctx) {
    			if (ctx.card.imageSrc !== '') {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div1, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if ((changed.card) && t2_value !== (t2_value = ctx.card.number)) {
    				set_data(t2, t2_value);
    			}

    			if (ctx.card.dates !== '') {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(div4, t4);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if ((changed.card) && t5_value !== (t5_value = ctx.card.name)) {
    				set_data(t5, t5_value);
    			}

    			if ((changed.card) && div5_class_value !== (div5_class_value = "card " + ctx.card.type + " svelte-k5k4n2")) {
    				div5.className = div5_class_value;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div6);
    			}

    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	const card = {
        type: '',
        name: '',
        number: '',
        dates: '',
        imageSrc: ''
      },
      chipImage = 'https://cdn.iconscout.com/icon/free/png-512/credit-card-chip-1537934-1302066.png';

      const unsubscribeNumber = storeCardNumber.subscribe(value=>{
        const cardPieces = value;
        card.number = cardPieces.split('').splice(0,4).join('') + ' ' + 
          cardPieces.split('').splice(4,4).join('') + ' ' +
          cardPieces.split('').splice(8,4).join('') + ' ' +
          cardPieces.split('').splice(12,4).join(''); $$invalidate('card', card);

        // IIN details from: 
        // https://en.wikipedia.org/wiki/Payment_card_number#Structure

        if (value.length === 0) {
          card.type = ''; $$invalidate('card', card);
          card.imageSrc = ''; $$invalidate('card', card);
          return;
        }

        if (value.length === 4 && value >= '2221' && value <= '2720') {
          card.type = 'master-card'; $$invalidate('card', card);
          card.imageSrc = 'http://creditcardimagelogos.com/wp-content/themes/e838pqefv3ejmkevzirye533556/files/logos/cdn_subdomain/mastercard_64.png'; $$invalidate('card', card);
          return;
        }

        if (value.length === 2 && value === '34' || value === '37') {
          card.type = 'amex'; $$invalidate('card', card);
          card.imageSrc = 'http://creditcardimagelogos.com/wp-content/themes/e838pqefv3ejmkevzirye533556/files/logos/new/cdn_subdomain/american_express_logo_5.gif'; $$invalidate('card', card);
          return;
        }

        if (value.length === 1 && value === '4') {
          card.type = 'visa'; $$invalidate('card', card);
          card.imageSrc = 'http://creditcardimagelogos.com/wp-content/themes/e838pqefv3ejmkevzirye533556/files/logos/new/cdn_subdomain/visa_logo_8.gif'; $$invalidate('card', card);
          return;
        }
      });

      const unsubscribeName = storeCardName.subscribe(value=>{ const $$result = card.name=value; $$invalidate('card', card); return $$result; });
      const unsubscribeDates = storeCardDates.subscribe(value=>{ const $$result = card.dates=value; $$invalidate('card', card); return $$result; });

    	return { card, chipImage };
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, []);
    	}
    }

    /* src/AddForm.svelte generated by Svelte v3.5.1 */

    const file$1 = "src/AddForm.svelte";

    function create_fragment$1(ctx) {
    	var div7, form, div1, input0, input0_class_value, t0, div0, t1, div0_class_value, t2, div3, input1, input1_class_value, t3, div2, t5, div5, input2, t6, input3, t7, input4, t8, div4, t9, div4_class_value, t10, div6, button, dispose;

    	return {
    		c: function create() {
    			div7 = element("div");
    			form = element("form");
    			div1 = element("div");
    			input0 = element("input");
    			t0 = space();
    			div0 = element("div");
    			t1 = text("Missing");
    			t2 = space();
    			div3 = element("div");
    			input1 = element("input");
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "Missing";
    			t5 = space();
    			div5 = element("div");
    			input2 = element("input");
    			t6 = space();
    			input3 = element("input");
    			t7 = space();
    			input4 = element("input");
    			t8 = space();
    			div4 = element("div");
    			t9 = text("Missing");
    			t10 = space();
    			div6 = element("div");
    			button = element("button");
    			button.textContent = "agregar metodo de pago";
    			attr(input0, "type", "text");
    			input0.name = "card-number";
    			input0.placeholder = "Numero de tarjeta";
    			input0.className = input0_class_value = "" + (ctx.invalidForm ? 'invalid' : '') + " svelte-ufuimo";
    			input0.maxLength = "16";
    			add_location(input0, file$1, 91, 6, 1605);
    			div0.className = div0_class_value = "error-msg " + (ctx.invalidForm ? 'invalid' : '') + " svelte-ufuimo";
    			add_location(div0, file$1, 97, 6, 1822);
    			div1.className = "form-field svelte-ufuimo";
    			add_location(div1, file$1, 90, 4, 1573);
    			attr(input1, "type", "text");
    			input1.name = "card-name";
    			input1.placeholder = "Nombre de tarjetahabiente";
    			input1.className = input1_class_value = "" + (ctx.invalidForm ? 'invalid' : '') + " svelte-ufuimo";
    			add_location(input1, file$1, 101, 6, 1943);
    			div2.className = "error-msg svelte-ufuimo";
    			add_location(div2, file$1, 106, 6, 2139);
    			div3.className = "form-field svelte-ufuimo";
    			add_location(div3, file$1, 100, 4, 1911);
    			attr(input2, "type", "number");
    			input2.name = "exp-month";
    			input2.placeholder = "MM";
    			input2.className = "small-width svelte-ufuimo";
    			input2.min = "1";
    			input2.max = "12";
    			add_location(input2, file$1, 110, 6, 2244);
    			attr(input3, "type", "number");
    			input3.name = "exp-year";
    			input3.placeholder = "AAAA";
    			input3.className = "mid-width svelte-ufuimo";
    			input3.min = "2010";
    			input3.max = "2050";
    			add_location(input3, file$1, 116, 6, 2426);
    			attr(input4, "type", "number");
    			input4.name = "ccv";
    			input4.placeholder = "CVV";
    			input4.className = "mid-width svelte-ufuimo";
    			input4.min = "100";
    			input4.max = "999";
    			add_location(input4, file$1, 122, 6, 2611);
    			div4.className = div4_class_value = "error-msg " + (ctx.invalidForm ? 'invalid' : '') + " svelte-ufuimo";
    			add_location(div4, file$1, 128, 6, 2784);
    			div5.className = "form-field back-of-card svelte-ufuimo";
    			add_location(div5, file$1, 109, 4, 2199);
    			button.type = "button";
    			button.className = "svelte-ufuimo";
    			add_location(button, file$1, 132, 6, 2905);
    			div6.className = "form-actions svelte-ufuimo";
    			add_location(div6, file$1, 131, 4, 2871);
    			form.className = "front-of-card";
    			add_location(form, file$1, 88, 2, 1537);
    			div7.className = "form-container svelte-ufuimo";
    			add_location(div7, file$1, 87, 0, 1505);

    			dispose = [
    				listen(input0, "input", ctx.input0_input_handler),
    				listen(input1, "input", ctx.input1_input_handler),
    				listen(input2, "input", ctx.input2_input_handler),
    				listen(input3, "input", ctx.input3_input_handler),
    				listen(input4, "input", ctx.input4_input_handler),
    				listen(button, "click", ctx.onFormSubmit)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div7, anchor);
    			append(div7, form);
    			append(form, div1);
    			append(div1, input0);

    			input0.value = ctx.cardData.cardNumber;

    			append(div1, t0);
    			append(div1, div0);
    			append(div0, t1);
    			append(form, t2);
    			append(form, div3);
    			append(div3, input1);

    			input1.value = ctx.cardData.cardHolder;

    			append(div3, t3);
    			append(div3, div2);
    			append(form, t5);
    			append(form, div5);
    			append(div5, input2);

    			input2.value = ctx.cardData.expMonth;

    			append(div5, t6);
    			append(div5, input3);

    			input3.value = ctx.cardData.expYear;

    			append(div5, t7);
    			append(div5, input4);

    			input4.value = ctx.cardData.ccv;

    			append(div5, t8);
    			append(div5, div4);
    			append(div4, t9);
    			append(form, t10);
    			append(form, div6);
    			append(div6, button);
    		},

    		p: function update(changed, ctx) {
    			if (changed.cardData && (input0.value !== ctx.cardData.cardNumber)) input0.value = ctx.cardData.cardNumber;

    			if ((changed.invalidForm) && input0_class_value !== (input0_class_value = "" + (ctx.invalidForm ? 'invalid' : '') + " svelte-ufuimo")) {
    				input0.className = input0_class_value;
    			}

    			if ((changed.invalidForm) && div0_class_value !== (div0_class_value = "error-msg " + (ctx.invalidForm ? 'invalid' : '') + " svelte-ufuimo")) {
    				div0.className = div0_class_value;
    			}

    			if (changed.cardData && (input1.value !== ctx.cardData.cardHolder)) input1.value = ctx.cardData.cardHolder;

    			if ((changed.invalidForm) && input1_class_value !== (input1_class_value = "" + (ctx.invalidForm ? 'invalid' : '') + " svelte-ufuimo")) {
    				input1.className = input1_class_value;
    			}

    			if (changed.cardData) input2.value = ctx.cardData.expMonth;
    			if (changed.cardData) input3.value = ctx.cardData.expYear;
    			if (changed.cardData) input4.value = ctx.cardData.ccv;

    			if ((changed.invalidForm) && div4_class_value !== (div4_class_value = "error-msg " + (ctx.invalidForm ? 'invalid' : '') + " svelte-ufuimo")) {
    				div4.className = div4_class_value;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div7);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let invalidForm = false,
        cardData = {
          cardNumber: '',
          cardHolder: '',
          expMonth: '',
          expYear: '',
          ccv: ''
        };
      
      function onFormSubmit() {
        $$invalidate('invalidForm', invalidForm = true);
      }

    	function input0_input_handler() {
    		cardData.cardNumber = this.value;
    		$$invalidate('cardData', cardData);
    	}

    	function input1_input_handler() {
    		cardData.cardHolder = this.value;
    		$$invalidate('cardData', cardData);
    	}

    	function input2_input_handler() {
    		cardData.expMonth = to_number(this.value);
    		$$invalidate('cardData', cardData);
    	}

    	function input3_input_handler() {
    		cardData.expYear = to_number(this.value);
    		$$invalidate('cardData', cardData);
    	}

    	function input4_input_handler() {
    		cardData.ccv = to_number(this.value);
    		$$invalidate('cardData', cardData);
    	}

    	$$self.$$.update = ($$dirty = { cardData: 1 }) => {
    		if ($$dirty.cardData) { {
            storeCardNumber.set(cardData.cardNumber);
            storeCardName.set(cardData.cardHolder);
            storeCardDates.set('');
            if (cardData.expMonth && cardData.expYear) {
              storeCardDates.set(cardData.expMonth+'/'+cardData.expYear);
            }
          } }
    	};

    	return {
    		invalidForm,
    		cardData,
    		onFormSubmit,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler
    	};
    }

    class AddForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    	}
    }

    /* src/App.svelte generated by Svelte v3.5.1 */

    const file$2 = "src/App.svelte";

    function create_fragment$2(ctx) {
    	var div, h2, t1, t2, current;

    	var card = new Card({ $$inline: true });

    	var addform = new AddForm({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Agregar Nuevo Metodo de Pago";
    			t1 = space();
    			card.$$.fragment.c();
    			t2 = space();
    			addform.$$.fragment.c();
    			add_location(h2, file$2, 36, 1, 526);
    			div.className = "container svelte-n0gvl0";
    			add_location(div, file$2, 35, 0, 501);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h2);
    			append(div, t1);
    			mount_component(card, div, null);
    			append(div, t2);
    			mount_component(addform, div, null);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			card.$$.fragment.i(local);

    			addform.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			card.$$.fragment.o(local);
    			addform.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			card.$destroy();

    			addform.$destroy();
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	

    	let count = 0;

    	$$self.$$.update = ($$dirty = { count: 1 }) => {
    		if ($$dirty.count) { {
    				console.log(`the count is: ${count}`);
    			} }
    		if ($$dirty.count) { if (count == 9) {
    				alert('wachaoffffut !!');
    			} }
    	};

    	return {};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, []);
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map

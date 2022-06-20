
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
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
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\components\Nav.svelte generated by Svelte v3.48.0 */

    const file$8 = "src\\components\\Nav.svelte";

    function create_fragment$9(ctx) {
    	let div1;
    	let nav;
    	let div0;
    	let a0;
    	let img;
    	let img_src_value;
    	let t0;
    	let ul;
    	let li0;
    	let a1;
    	let t2;
    	let li1;
    	let a2;
    	let t4;
    	let li2;
    	let a3;
    	let t6;
    	let li3;
    	let a4;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			nav = element("nav");
    			div0 = element("div");
    			a0 = element("a");
    			img = element("img");
    			t0 = space();
    			ul = element("ul");
    			li0 = element("li");
    			a1 = element("a");
    			a1.textContent = "HOME";
    			t2 = space();
    			li1 = element("li");
    			a2 = element("a");
    			a2.textContent = "PROFILE";
    			t4 = space();
    			li2 = element("li");
    			a3 = element("a");
    			a3.textContent = "DISCOGRAPHY";
    			t6 = space();
    			li3 = element("li");
    			a4 = element("a");
    			a4.textContent = "MEDIA";
    			if (!src_url_equal(img.src, img_src_value = "../img/logo.png")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$8, 12, 59, 256);
    			attr_dev(a0, "class", "uk-navbar-item uk-logo svelte-10bqho8");
    			attr_dev(a0, "href", "#");
    			add_location(a0, file$8, 12, 16, 213);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "uk-scroll", "");
    			attr_dev(a1, "class", "svelte-10bqho8");
    			add_location(a1, file$8, 14, 24, 357);
    			attr_dev(li0, "class", "svelte-10bqho8");
    			add_location(li0, file$8, 14, 20, 353);
    			attr_dev(a2, "href", "#profile");
    			attr_dev(a2, "uk-scroll", "");
    			attr_dev(a2, "class", "svelte-10bqho8");
    			add_location(a2, file$8, 15, 24, 418);
    			attr_dev(li1, "class", "svelte-10bqho8");
    			add_location(li1, file$8, 15, 20, 414);
    			attr_dev(a3, "href", "#discography");
    			attr_dev(a3, "uk-scroll", "");
    			attr_dev(a3, "class", "svelte-10bqho8");
    			add_location(a3, file$8, 16, 24, 489);
    			attr_dev(li2, "class", "svelte-10bqho8");
    			add_location(li2, file$8, 16, 20, 485);
    			attr_dev(a4, "href", "#media");
    			attr_dev(a4, "uk-scroll", "");
    			attr_dev(a4, "class", "svelte-10bqho8");
    			add_location(a4, file$8, 17, 24, 568);
    			attr_dev(li3, "class", "svelte-10bqho8");
    			add_location(li3, file$8, 17, 20, 564);
    			attr_dev(ul, "class", "uk-navbar-nav");
    			add_location(ul, file$8, 13, 16, 305);
    			attr_dev(div0, "class", "uk-navbar-left");
    			add_location(div0, file$8, 11, 12, 167);
    			attr_dev(nav, "class", "uk-navbar-container uk-navbar-transparent");
    			attr_dev(nav, "uk-navbar", "");
    			add_location(nav, file$8, 9, 8, 86);
    			attr_dev(div1, "class", "uk-position-top");
    			add_location(div1, file$8, 8, 1, 47);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, nav);
    			append_dev(nav, div0);
    			append_dev(div0, a0);
    			append_dev(a0, img);
    			append_dev(div0, t0);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a1);
    			append_dev(ul, t2);
    			append_dev(ul, li1);
    			append_dev(li1, a2);
    			append_dev(ul, t4);
    			append_dev(ul, li2);
    			append_dev(li2, a3);
    			append_dev(ul, t6);
    			append_dev(ul, li3);
    			append_dev(li3, a4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Nav', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\shared\Footer.svelte generated by Svelte v3.48.0 */

    const file$7 = "src\\shared\\Footer.svelte";

    function create_fragment$8(ctx) {
    	let footer;
    	let div;
    	let a0;
    	let i0;
    	let t0;
    	let a1;
    	let i1;
    	let t1;
    	let a2;
    	let i2;
    	let t2;
    	let a3;
    	let i3;
    	let t3;
    	let a4;
    	let i4;
    	let t4;
    	let a5;
    	let i5;
    	let t5;
    	let p0;
    	let p1;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div = element("div");
    			a0 = element("a");
    			i0 = element("i");
    			t0 = space();
    			a1 = element("a");
    			i1 = element("i");
    			t1 = space();
    			a2 = element("a");
    			i2 = element("i");
    			t2 = space();
    			a3 = element("a");
    			i3 = element("i");
    			t3 = space();
    			a4 = element("a");
    			i4 = element("i");
    			t4 = space();
    			a5 = element("a");
    			i5 = element("i");
    			t5 = space();
    			p0 = element("p");
    			p0.textContent = "COPYRIGHT © 2021 Dreamcatcher Company / Happyface Entertainment. ALL RIGHTS RESERVED";
    			p1 = element("p");
    			attr_dev(i0, "class", "fa-brands fa-instagram svelte-1dt3ked");
    			add_location(i0, file$7, 5, 61, 199);
    			attr_dev(a0, "href", "https://www.instagram.com/hf_dreamcatcher/");
    			add_location(a0, file$7, 5, 8, 146);
    			attr_dev(i1, "class", "fa-brands fa-twitter svelte-1dt3ked");
    			add_location(i1, file$7, 6, 54, 297);
    			attr_dev(a1, "href", "https://twitter.com/hf_dreamcatcher");
    			add_location(a1, file$7, 6, 8, 251);
    			attr_dev(i2, "class", "fa-brands fa-facebook svelte-1dt3ked");
    			add_location(i2, file$7, 7, 65, 404);
    			attr_dev(a2, "href", "https://www.facebook.com/happyfacedreamcatcher");
    			add_location(a2, file$7, 7, 8, 347);
    			attr_dev(i3, "class", "fa-brands fa-weibo svelte-1dt3ked");
    			add_location(i3, file$7, 8, 50, 497);
    			attr_dev(a3, "href", "https://weibo.com/dreamcatcher7");
    			add_location(a3, file$7, 8, 8, 455);
    			attr_dev(i4, "class", "fa-brands fa-youtube svelte-1dt3ked");
    			add_location(i4, file$7, 9, 91, 628);
    			attr_dev(a4, "href", "https://www.youtube.com/playlist?list=PLll3b9MjHm8G6R8EGNcvh76rTsUAKYMCS");
    			add_location(a4, file$7, 9, 8, 545);
    			attr_dev(i5, "class", "fa-brands fa-tiktok svelte-1dt3ked");
    			add_location(i5, file$7, 10, 64, 734);
    			attr_dev(a5, "href", "https://www.tiktok.com/@official_dreamcatcher");
    			add_location(a5, file$7, 10, 8, 678);
    			attr_dev(div, "class", "socials uk-flex uk-flex-center svelte-1dt3ked");
    			add_location(div, file$7, 4, 4, 91);
    			attr_dev(p0, "class", "uk-flex uk-flex-center svelte-1dt3ked");
    			add_location(p0, file$7, 12, 4, 791);
    			attr_dev(p1, "class", "svelte-1dt3ked");
    			add_location(p1, file$7, 12, 122, 909);
    			attr_dev(footer, "class", "uk-flex uk-flex-column svelte-1dt3ked");
    			add_location(footer, file$7, 3, 0, 46);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div);
    			append_dev(div, a0);
    			append_dev(a0, i0);
    			append_dev(div, t0);
    			append_dev(div, a1);
    			append_dev(a1, i1);
    			append_dev(div, t1);
    			append_dev(div, a2);
    			append_dev(a2, i2);
    			append_dev(div, t2);
    			append_dev(div, a3);
    			append_dev(a3, i3);
    			append_dev(div, t3);
    			append_dev(div, a4);
    			append_dev(a4, i4);
    			append_dev(div, t4);
    			append_dev(div, a5);
    			append_dev(a5, i5);
    			append_dev(footer, t5);
    			append_dev(footer, p0);
    			append_dev(footer, p1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\shared\HeroText.svelte generated by Svelte v3.48.0 */

    function create_fragment$7(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HeroText', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HeroText> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class HeroText extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HeroText",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\components\Hero.svelte generated by Svelte v3.48.0 */
    const file$6 = "src\\components\\Hero.svelte";

    function create_fragment$6(ctx) {
    	let div5;
    	let div4;
    	let div3;
    	let ul;
    	let li0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div0;
    	let p0;
    	let herotext0;
    	let t1;
    	let li1;
    	let img1;
    	let img1_src_value;
    	let t2;
    	let div1;
    	let p1;
    	let herotext1;
    	let t3;
    	let li2;
    	let img2;
    	let img2_src_value;
    	let t4;
    	let div2;
    	let p2;
    	let herotext2;
    	let t5;
    	let a0;
    	let t6;
    	let a1;
    	let t7;
    	let nav;
    	let current;
    	herotext0 = new HeroText({ $$inline: true });
    	herotext1 = new HeroText({ $$inline: true });
    	herotext2 = new HeroText({ $$inline: true });
    	nav = new Nav({ $$inline: true });

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			img0 = element("img");
    			t0 = space();
    			div0 = element("div");
    			p0 = element("p");
    			create_component(herotext0.$$.fragment);
    			t1 = space();
    			li1 = element("li");
    			img1 = element("img");
    			t2 = space();
    			div1 = element("div");
    			p1 = element("p");
    			create_component(herotext1.$$.fragment);
    			t3 = space();
    			li2 = element("li");
    			img2 = element("img");
    			t4 = space();
    			div2 = element("div");
    			p2 = element("p");
    			create_component(herotext2.$$.fragment);
    			t5 = space();
    			a0 = element("a");
    			t6 = space();
    			a1 = element("a");
    			t7 = space();
    			create_component(nav.$$.fragment);
    			if (!src_url_equal(img0.src, img0_src_value = "../img/group-img-min.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "group");
    			attr_dev(img0, "uk-cover", "");
    			add_location(img0, file$6, 13, 14, 452);
    			attr_dev(p0, "class", "uk-margin-remove");
    			add_location(p0, file$6, 15, 18, 619);
    			attr_dev(div0, "class", "uk-position-center uk-position-small uk-text-center uk-light");
    			add_location(div0, file$6, 14, 14, 525);
    			add_location(li0, file$6, 12, 10, 432);
    			if (!src_url_equal(img1.src, img1_src_value = "../img/group-black-min.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "group-dark");
    			attr_dev(img1, "uk-cover", "");
    			add_location(img1, file$6, 20, 14, 753);
    			attr_dev(p1, "class", "uk-margin-remove");
    			add_location(p1, file$6, 22, 18, 927);
    			attr_dev(div1, "class", "uk-position-center uk-position-small uk-text-center uk-light");
    			add_location(div1, file$6, 21, 14, 833);
    			add_location(li1, file$6, 19, 10, 733);
    			if (!src_url_equal(img2.src, img2_src_value = "../img/group-white-min.jpg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "group-white");
    			attr_dev(img2, "uk-cover", "");
    			add_location(img2, file$6, 26, 14, 1041);
    			attr_dev(p2, "class", "uk-margin-remove");
    			add_location(p2, file$6, 28, 17, 1215);
    			attr_dev(div2, "class", "uk-position-center uk-position-small uk-text-center uk-light");
    			add_location(div2, file$6, 27, 14, 1122);
    			add_location(li2, file$6, 25, 10, 1021);
    			attr_dev(ul, "class", "uk-slideshow-items");
    			add_location(ul, file$6, 11, 6, 389);
    			attr_dev(a0, "class", "uk-position-center-left uk-position-small uk-hidden-hover");
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "uk-slidenav-previous", "");
    			attr_dev(a0, "uk-slideshow-item", "previous");
    			add_location(a0, file$6, 32, 6, 1318);
    			attr_dev(a1, "class", "uk-position-center-right uk-position-small uk-hidden-hover");
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "uk-slidenav-next", "");
    			attr_dev(a1, "uk-slideshow-item", "next");
    			add_location(a1, file$6, 33, 6, 1458);
    			attr_dev(div3, "class", "uk-position-relative uk-visible-toggle uk-light");
    			attr_dev(div3, "tabindex", "-1");
    			attr_dev(div3, "uk-slideshow", "animation:slide; autoplay: true; autoplay-interval: 6000 ");
    			add_location(div3, file$6, 10, 5, 232);
    			attr_dev(div4, "class", "uk-position-relative");
    			add_location(div4, file$6, 9, 1, 191);
    			attr_dev(div5, "class", "Hero");
    			add_location(div5, file$6, 8, 0, 170);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, ul);
    			append_dev(ul, li0);
    			append_dev(li0, img0);
    			append_dev(li0, t0);
    			append_dev(li0, div0);
    			append_dev(div0, p0);
    			mount_component(herotext0, p0, null);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, img1);
    			append_dev(li1, t2);
    			append_dev(li1, div1);
    			append_dev(div1, p1);
    			mount_component(herotext1, p1, null);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, img2);
    			append_dev(li2, t4);
    			append_dev(li2, div2);
    			append_dev(div2, p2);
    			mount_component(herotext2, p2, null);
    			append_dev(div3, t5);
    			append_dev(div3, a0);
    			append_dev(div3, t6);
    			append_dev(div3, a1);
    			append_dev(div4, t7);
    			mount_component(nav, div4, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(herotext0.$$.fragment, local);
    			transition_in(herotext1.$$.fragment, local);
    			transition_in(herotext2.$$.fragment, local);
    			transition_in(nav.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(herotext0.$$.fragment, local);
    			transition_out(herotext1.$$.fragment, local);
    			transition_out(herotext2.$$.fragment, local);
    			transition_out(nav.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(herotext0);
    			destroy_component(herotext1);
    			destroy_component(herotext2);
    			destroy_component(nav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Hero', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Hero> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Nav, Footer, HeroText });
    	return [];
    }

    class Hero extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hero",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\components\Members.svelte generated by Svelte v3.48.0 */

    const file$5 = "src\\components\\Members.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (75:3) {#each Members as member (member.id)}
    function create_each_block$2(key_1, ctx) {
    	let li;
    	let div1;
    	let a;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div0;
    	let h3;
    	let t1_value = /*member*/ ctx[1].name + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*member*/ ctx[1].position + "";
    	let t3;
    	let t4;
    	let div3;
    	let div2;
    	let button;
    	let t5;
    	let img1;
    	let img1_src_value;
    	let t6;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			div1 = element("div");
    			a = element("a");
    			img0 = element("img");
    			t0 = space();
    			div0 = element("div");
    			h3 = element("h3");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			div3 = element("div");
    			div2 = element("div");
    			button = element("button");
    			t5 = space();
    			img1 = element("img");
    			t6 = space();
    			if (!src_url_equal(img0.src, img0_src_value = `../img/${/*member*/ ctx[1].profileDark}`)) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "width", "100%");
    			attr_dev(img0, "height", "500");
    			attr_dev(img0, "alt", "member photo");
    			add_location(img0, file$5, 77, 57, 1936);
    			attr_dev(a, "href", "#modal-media-image");
    			attr_dev(a, "uk-toggle", "");
    			add_location(a, file$5, 77, 17, 1896);
    			attr_dev(h3, "class", "uk-margin-remove name uk-text-large .uk-text-bold svelte-1b4etp3");
    			add_location(h3, file$5, 79, 21, 2173);
    			attr_dev(p, "class", "uk-margin-remove svelte-1b4etp3");
    			add_location(p, file$5, 80, 21, 2276);
    			attr_dev(div0, "class", "uk-overlay uk-overlay-primary uk-position-bottom uk-text-center uk-transition-slide-bottom");
    			add_location(div0, file$5, 78, 17, 2046);
    			attr_dev(div1, "class", "uk-panel");
    			attr_dev(div1, "uk-scrollspy", "cls: uk-animation-fade; delay: 100; repeat: true");
    			add_location(div1, file$5, 76, 13, 1791);
    			attr_dev(button, "class", "uk-modal-close-outside");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "uk-close", "");
    			add_location(button, file$5, 85, 20, 2551);
    			if (!src_url_equal(img1.src, img1_src_value = `../img/${/*member*/ ctx[1].profileDark}`)) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "width", "1800");
    			attr_dev(img1, "height", "1200");
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$5, 86, 20, 2645);
    			attr_dev(div2, "class", "uk-modal-dialog uk-width-auto uk-margin-auto-vertical");
    			add_location(div2, file$5, 84, 16, 2462);
    			attr_dev(div3, "id", "modal-media-image");
    			attr_dev(div3, "class", "uk-flex-top");
    			attr_dev(div3, "uk-modal", "");
    			add_location(div3, file$5, 83, 14, 2387);
    			attr_dev(li, "class", "uk-width-3-4");
    			add_location(li, file$5, 75, 4, 1751);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div1);
    			append_dev(div1, a);
    			append_dev(a, img0);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, h3);
    			append_dev(h3, t1);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			append_dev(p, t3);
    			append_dev(li, t4);
    			append_dev(li, div3);
    			append_dev(div3, div2);
    			append_dev(div2, button);
    			append_dev(div2, t5);
    			append_dev(div2, img1);
    			append_dev(li, t6);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(75:3) {#each Members as member (member.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t0;
    	let a0;
    	let t1;
    	let a1;
    	let each_value = /*Members*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*member*/ ctx[1].id;
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			a0 = element("a");
    			t1 = space();
    			a1 = element("a");
    			attr_dev(ul, "class", "uk-slider-items uk-grid");
    			add_location(ul, file$5, 73, 2, 1667);
    			attr_dev(a0, "class", "uk-position-center-left uk-position-small uk-hidden-hover");
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "uk-slidenav-previous", "");
    			attr_dev(a0, "uk-slider-item", "previous");
    			add_location(a0, file$5, 93, 3, 2824);
    			attr_dev(a1, "class", "uk-position-center-right uk-position-small uk-hidden-hover");
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "uk-slidenav-next", "");
    			attr_dev(a1, "uk-slider-item", "next");
    			add_location(a1, file$5, 94, 4, 2959);
    			attr_dev(div, "class", "uk-position-relative uk-visible-toggle uk-light");
    			attr_dev(div, "tabindex", "-1");
    			attr_dev(div, "uk-slider", "clsActivated: uk-transition-active; center: true; autoplay: true ");
    			attr_dev(div, "loading", "lazy");
    			add_location(div, file$5, 72, 0, 1495);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(div, t0);
    			append_dev(div, a0);
    			append_dev(div, t1);
    			append_dev(div, a1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Members*/ 1) {
    				each_value = /*Members*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, destroy_block, create_each_block$2, null, get_each_context$2);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Members', slots, []);

    	const Members = [
    		{
    			id: 1,
    			name: 'Jiu',
    			position: 'Leader,visual',
    			birthday: 'May 17, 1994',
    			instagram: 'https://www.instagram.com/minjiu__u/',
    			profileDark: 'jiu.jpg'
    		},
    		{
    			id: 2,
    			name: 'Sua',
    			position: 'Main dancer, Lead Rapper',
    			birthday: 'August 10, 1994',
    			instagram: 'https://www.instagram.com/sualelbora/',
    			profileDark: 'sua.jpg'
    		},
    		{
    			id: 3,
    			name: 'Siyeon',
    			position: 'Main vocalist',
    			birthday: 'October 1, 1995',
    			instagram: 'https://www.instagram.com/______s2ing/',
    			profileDark: 'siyeon.jpg'
    		},
    		{
    			id: 4,
    			name: 'Handong',
    			position: 'Sub vocalist',
    			birthday: 'March 26, 1996',
    			instagram: 'https://www.instagram.com/0.0_handong/',
    			profileDark: 'handong.jpg'
    		},
    		{
    			id: 5,
    			name: 'Yoohyeon',
    			position: 'Lead vocalist',
    			birthday: 'January 7, 1997',
    			instagram: 'https://www.instagram.com/ms.yoohyeonkim/',
    			profileDark: 'yoohyeon.jpg'
    		},
    		{
    			id: 6,
    			name: 'Dami',
    			position: 'Main rapper, Lead dancer',
    			birthday: 'March 7, 1997',
    			instagram: 'https://www.instagram.com/00ld_ami/',
    			profileDark: 'dami.jpg'
    		},
    		{
    			id: 7,
    			name: 'Gahyeon',
    			position: 'Maknae, Lead rapper',
    			birthday: 'February 3, 1999',
    			instagram: 'https://www.instagram.com/fox._.zzlo_/',
    			profileDark: 'gahyeon.jpg'
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Members> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Members });
    	return [Members];
    }

    class Members_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Members_1",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\Profile.svelte generated by Svelte v3.48.0 */
    const file$4 = "src\\components\\Profile.svelte";

    function create_fragment$4(ctx) {
    	let div4;
    	let h20;
    	let t0;
    	let hr0;
    	let t1;
    	let div2;
    	let div0;
    	let p;
    	let t3;
    	let div1;
    	let img;
    	let img_src_value;
    	let t4;
    	let div3;
    	let h21;
    	let t5;
    	let hr1;
    	let t6;
    	let members;
    	let current;
    	members = new Members_1({ $$inline: true });

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			h20 = element("h2");
    			t0 = text("Group Profile");
    			hr0 = element("hr");
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Dreamcatcher (드림캐쳐) is a seven member group consisting of: JiU, SuA, Siyeon, Handong, Yoohyeon, Dami, and Gahyeon, with each member representing a nightmare or fear. The group debuted on January 13, 2017 with the single album Nightmare, under Happyface Entertainment. They are currently under Dreamcatcher Company.";
    			t3 = space();
    			div1 = element("div");
    			img = element("img");
    			t4 = space();
    			div3 = element("div");
    			h21 = element("h2");
    			t5 = text("Members");
    			hr1 = element("hr");
    			t6 = space();
    			create_component(members.$$.fragment);
    			attr_dev(hr0, "class", "svelte-1bbdb1q");
    			add_location(hr0, file$4, 6, 47, 161);
    			attr_dev(h20, "class", "group-profile-header svelte-1bbdb1q");
    			add_location(h20, file$4, 6, 1, 115);
    			attr_dev(p, "class", "uk-text-normal uk-text-large uk-text-center");
    			add_location(p, file$4, 9, 3, 322);
    			attr_dev(div0, "class", "left svelte-1bbdb1q");
    			attr_dev(div0, "uk-grid", "");
    			attr_dev(div0, "uk-scrollspy", "cls: uk-animation-fade; delay: 100; repeat: false");
    			add_location(div0, file$4, 8, 2, 224);
    			attr_dev(img, "class", "profile-img svelte-1bbdb1q");
    			if (!src_url_equal(img.src, img_src_value = "../img/group-white-min.jpg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$4, 12, 3, 807);
    			attr_dev(div1, "class", "right");
    			attr_dev(div1, "uk-grid", "");
    			attr_dev(div1, "uk-scrollspy", "cls: uk-animation-fade; delay: 100; repeat: false");
    			add_location(div1, file$4, 11, 2, 709);
    			attr_dev(div2, "class", "uk-child-width-1-2@m info");
    			attr_dev(div2, "uk-grid", "");
    			add_location(div2, file$4, 7, 1, 173);
    			attr_dev(hr1, "class", "svelte-1bbdb1q");
    			add_location(hr1, file$4, 17, 42, 954);
    			attr_dev(h21, "class", "group-profile-header svelte-1bbdb1q");
    			add_location(h21, file$4, 17, 2, 914);
    			attr_dev(div3, "class", "members");
    			add_location(div3, file$4, 16, 1, 889);
    			attr_dev(div4, "class", "profile ");
    			add_location(div4, file$4, 5, 0, 90);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, h20);
    			append_dev(h20, t0);
    			append_dev(h20, hr0);
    			append_dev(div4, t1);
    			append_dev(div4, div2);
    			append_dev(div2, div0);
    			append_dev(div0, p);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, h21);
    			append_dev(h21, t5);
    			append_dev(h21, hr1);
    			append_dev(div3, t6);
    			mount_component(members, div3, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(members.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(members.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(members);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Profile', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Profile> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Members: Members_1 });
    	return [];
    }

    class Profile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Profile",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\shared\Tabs.svelte generated by Svelte v3.48.0 */
    const file$3 = "src\\shared\\Tabs.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (18:2) {#if Array.isArray(items)}
    function create_if_block$1(ctx) {
    	let each_1_anchor;
    	let each_value = /*items*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*activeTabValue, items, handleClick*/ 7) {
    				each_value = /*items*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(18:2) {#if Array.isArray(items)}",
    		ctx
    	});

    	return block;
    }

    // (19:4) {#each items as item}
    function create_each_block$1(ctx) {
    	let li;
    	let p;
    	let t0_value = /*item*/ ctx[3].label + "";
    	let t0;
    	let t1;
    	let li_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(p, "class", "svelte-1152afd");
    			add_location(p, file$3, 20, 8, 501);

    			attr_dev(li, "class", li_class_value = "" + (null_to_empty(/*activeTabValue*/ ctx[0] === /*item*/ ctx[3].value
    			? 'active'
    			: '') + " svelte-1152afd"));

    			add_location(li, file$3, 19, 6, 432);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, p);
    			append_dev(p, t0);
    			append_dev(li, t1);

    			if (!mounted) {
    				dispose = listen_dev(
    					p,
    					"click",
    					function () {
    						if (is_function(/*handleClick*/ ctx[2](/*item*/ ctx[3].value))) /*handleClick*/ ctx[2](/*item*/ ctx[3].value).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*items*/ 2 && t0_value !== (t0_value = /*item*/ ctx[3].label + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*activeTabValue, items*/ 3 && li_class_value !== (li_class_value = "" + (null_to_empty(/*activeTabValue*/ ctx[0] === /*item*/ ctx[3].value
    			? 'active'
    			: '') + " svelte-1152afd"))) {
    				attr_dev(li, "class", li_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(19:4) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let ul;
    	let show_if = Array.isArray(/*items*/ ctx[1]);
    	let if_block = show_if && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			if (if_block) if_block.c();
    			attr_dev(ul, "class", "svelte-1152afd");
    			add_location(ul, file$3, 16, 0, 362);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			if (if_block) if_block.m(ul, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*items*/ 2) show_if = Array.isArray(/*items*/ ctx[1]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(ul, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tabs', slots, []);
    	let { items = [] } = $$props;
    	let { activeTabValue } = $$props;

    	onMount(() => {
    		// Set default tab value
    		if (Array.isArray(items) && items.length && items[0].value) {
    			$$invalidate(0, activeTabValue = items[0].value);
    		}
    	});

    	const handleClick = tabValue => () => $$invalidate(0, activeTabValue = tabValue);
    	const writable_props = ['items', 'activeTabValue'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tabs> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('items' in $$props) $$invalidate(1, items = $$props.items);
    		if ('activeTabValue' in $$props) $$invalidate(0, activeTabValue = $$props.activeTabValue);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		items,
    		activeTabValue,
    		handleClick
    	});

    	$$self.$inject_state = $$props => {
    		if ('items' in $$props) $$invalidate(1, items = $$props.items);
    		if ('activeTabValue' in $$props) $$invalidate(0, activeTabValue = $$props.activeTabValue);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [activeTabValue, items, handleClick];
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { items: 1, activeTabValue: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*activeTabValue*/ ctx[0] === undefined && !('activeTabValue' in props)) {
    			console.warn("<Tabs> was created without expected prop 'activeTabValue'");
    		}
    	}

    	get items() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeTabValue() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeTabValue(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Discography.svelte generated by Svelte v3.48.0 */
    const file$2 = "src\\components\\Discography.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (73:1) {#if 1 === currentTab}
    function create_if_block_2(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value_2 = /*StudioAlbums*/ ctx[2];
    	validate_each_argument(each_value_2);
    	const get_key = ctx => /*studio*/ ctx[12].id;
    	validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		let child_ctx = get_each_context_2(ctx, each_value_2, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "uk-child-width-1-2@s uk-child-width-1-3@m uk-text-center uk-grid-match");
    			attr_dev(div, "uk-grid", "");
    			add_location(div, file$2, 73, 2, 2410);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*StudioAlbums*/ 4) {
    				each_value_2 = /*StudioAlbums*/ ctx[2];
    				validate_each_argument(each_value_2);
    				validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_2, each_1_lookup, div, destroy_block, create_each_block_2, null, get_each_context_2);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(73:1) {#if 1 === currentTab}",
    		ctx
    	});

    	return block;
    }

    // (75:3) {#each StudioAlbums as studio (studio.id)}
    function create_each_block_2(key_1, ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let h3;
    	let t1_value = /*studio*/ ctx[12].name + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*studio*/ ctx[12].date + "";
    	let t3;
    	let t4;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h3 = element("h3");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			if (!src_url_equal(img.src, img_src_value = `../img/albums/${/*studio*/ ctx[12].cover}`)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "cover");
    			add_location(img, file$2, 78, 19, 2693);
    			attr_dev(div0, "class", "uk-card-media-top");
    			add_location(div0, file$2, 77, 15, 2641);
    			attr_dev(h3, "class", "uk-card-title svelte-1q2ygzc");
    			add_location(h3, file$2, 81, 19, 2835);
    			add_location(p, file$2, 82, 19, 2900);
    			attr_dev(div1, "class", "uk-card-body");
    			add_location(div1, file$2, 80, 15, 2788);
    			attr_dev(div2, "class", "uk-card uk-card-hover uk-card-default");
    			add_location(div2, file$2, 76, 10, 2573);
    			add_location(div3, file$2, 75, 5, 2556);
    			this.first = div3;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h3);
    			append_dev(h3, t1);
    			append_dev(div1, t2);
    			append_dev(div1, p);
    			append_dev(p, t3);
    			append_dev(div3, t4);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(75:3) {#each StudioAlbums as studio (studio.id)}",
    		ctx
    	});

    	return block;
    }

    // (92:1) {#if 2 === currentTab}
    function create_if_block_1(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value_1 = /*MiniAlbums*/ ctx[3];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*mini*/ ctx[9].id;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "uk-child-width-1-2@s uk-child-width-1-3@m uk-text-center uk-grid-match");
    			attr_dev(div, "uk-grid", "");
    			add_location(div, file$2, 92, 2, 3040);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*MiniAlbums*/ 8) {
    				each_value_1 = /*MiniAlbums*/ ctx[3];
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div, destroy_block, create_each_block_1, null, get_each_context_1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(92:1) {#if 2 === currentTab}",
    		ctx
    	});

    	return block;
    }

    // (94:3) {#each MiniAlbums as mini (mini.id)}
    function create_each_block_1(key_1, ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let h3;
    	let t1_value = /*mini*/ ctx[9].name + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*mini*/ ctx[9].date + "";
    	let t3;
    	let t4;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h3 = element("h3");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			if (!src_url_equal(img.src, img_src_value = `../img/albums/${/*mini*/ ctx[9].cover}`)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "cover");
    			add_location(img, file$2, 97, 19, 3318);
    			attr_dev(div0, "class", "uk-card-media-top");
    			add_location(div0, file$2, 96, 15, 3266);
    			attr_dev(h3, "class", "uk-card-title svelte-1q2ygzc");
    			add_location(h3, file$2, 100, 19, 3458);
    			add_location(p, file$2, 101, 19, 3521);
    			attr_dev(div1, "class", "uk-card-body");
    			add_location(div1, file$2, 99, 15, 3411);
    			attr_dev(div2, "class", "uk-card uk-card-hover uk-card-default");
    			add_location(div2, file$2, 95, 11, 3198);
    			add_location(div3, file$2, 94, 5, 3180);
    			this.first = div3;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h3);
    			append_dev(h3, t1);
    			append_dev(div1, t2);
    			append_dev(div1, p);
    			append_dev(p, t3);
    			append_dev(div3, t4);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(94:3) {#each MiniAlbums as mini (mini.id)}",
    		ctx
    	});

    	return block;
    }

    // (110:1) {#if 3 === currentTab}
    function create_if_block(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*SingleAlbums*/ ctx[4];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*single*/ ctx[6].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "uk-child-width-1-2@s uk-child-width-1-3@m uk-text-center uk-grid-match");
    			attr_dev(div, "uk-grid", "");
    			add_location(div, file$2, 110, 2, 3657);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*SingleAlbums*/ 16) {
    				each_value = /*SingleAlbums*/ ctx[4];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block, null, get_each_context);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(110:1) {#if 3 === currentTab}",
    		ctx
    	});

    	return block;
    }

    // (112:3) {#each SingleAlbums as single (single.id)}
    function create_each_block(key_1, ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let h3;
    	let t1_value = /*single*/ ctx[6].name + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*single*/ ctx[6].date + "";
    	let t3;
    	let t4;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h3 = element("h3");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			if (!src_url_equal(img.src, img_src_value = `../img/albums/${/*single*/ ctx[6].cover}`)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "cover");
    			add_location(img, file$2, 115, 19, 3941);
    			attr_dev(div0, "class", "uk-card-media-top");
    			add_location(div0, file$2, 114, 15, 3889);
    			attr_dev(h3, "class", "uk-card-title svelte-1q2ygzc");
    			add_location(h3, file$2, 118, 19, 4083);
    			add_location(p, file$2, 119, 19, 4148);
    			attr_dev(div1, "class", "uk-card-body");
    			add_location(div1, file$2, 117, 15, 4036);
    			attr_dev(div2, "class", "uk-card uk-card-hover uk-card-default");
    			add_location(div2, file$2, 113, 11, 3821);
    			add_location(div3, file$2, 112, 5, 3803);
    			this.first = div3;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h3);
    			append_dev(h3, t1);
    			append_dev(div1, t2);
    			append_dev(div1, p);
    			append_dev(p, t3);
    			append_dev(div3, t4);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(112:3) {#each SingleAlbums as single (single.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let tabs;
    	let updating_activeTabValue;
    	let t0;
    	let code;
    	let t1;
    	let t2;
    	let t3;
    	let if_block2_anchor;
    	let current;

    	function tabs_activeTabValue_binding(value) {
    		/*tabs_activeTabValue_binding*/ ctx[5](value);
    	}

    	let tabs_props = { items: /*tabItems*/ ctx[1] };

    	if (/*currentTab*/ ctx[0] !== void 0) {
    		tabs_props.activeTabValue = /*currentTab*/ ctx[0];
    	}

    	tabs = new Tabs({ props: tabs_props, $$inline: true });
    	binding_callbacks.push(() => bind(tabs, 'activeTabValue', tabs_activeTabValue_binding));
    	let if_block0 = 1 === /*currentTab*/ ctx[0] && create_if_block_2(ctx);
    	let if_block1 = 2 === /*currentTab*/ ctx[0] && create_if_block_1(ctx);
    	let if_block2 = 3 === /*currentTab*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			create_component(tabs.$$.fragment);
    			t0 = space();
    			code = element("code");
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			attr_dev(code, "class", "language-text");
    			add_location(code, file$2, 70, 0, 2344);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tabs, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, code, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tabs_changes = {};

    			if (!updating_activeTabValue && dirty & /*currentTab*/ 1) {
    				updating_activeTabValue = true;
    				tabs_changes.activeTabValue = /*currentTab*/ ctx[0];
    				add_flush_callback(() => updating_activeTabValue = false);
    			}

    			tabs.$set(tabs_changes);

    			if (1 === /*currentTab*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(t2.parentNode, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (2 === /*currentTab*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(t3.parentNode, t3);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (3 === /*currentTab*/ ctx[0]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabs.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabs.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tabs, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(code);
    			if (detaching) detach_dev(t1);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Discography', slots, []);

    	let tabItems = [
    		{ label: "Studio Album", value: 1 },
    		{ label: "Mini Album", value: 2 },
    		{ label: "Single Album", value: 3 }
    	];

    	let currentTab;

    	const StudioAlbums = [
    		{
    			id: 1,
    			name: 'The Beginning of the End',
    			date: 'September 11, 2019',
    			cover: "Beginning_of_the_end.jpg",
    			albumInfo: 'The Beginning of the End is the first Japanese album and the first studio album by Dreamcatcher released in September 11, 2019',
    			tracks: [{ name: 'fdsfdsfs' }, { name: 'fdsfdsfs' }]
    		},
    		{
    			id: 2,
    			name: 'Dystopia: The Tree of Language',
    			date: 'February 18, 2020',
    			cover: "Tree_of_Language.jpg"
    		},
    		{
    			id: 3,
    			name: 'Apocalypse: Save us',
    			date: 'April 12, 2022',
    			cover: "Apocalypse_Save_us.jpg"
    		}
    	];

    	const MiniAlbums = [
    		{
    			id: 1,
    			name: 'Prequel',
    			date: 'July 27, 2017',
    			cover: "Prequel.jpg"
    		},
    		{
    			id: 2,
    			name: 'Nightmare - Escape the ERA',
    			date: 'May 10, 2018',
    			cover: "Escape_The_Era.png"
    		},
    		{
    			id: 3,
    			name: 'Alone in the city',
    			date: 'September 20, 2018 ',
    			cover: "Alone_In_The_City.jpg"
    		},
    		{
    			id: 4,
    			name: 'The End of Nightmare',
    			date: 'February 13, 2019',
    			cover: "The_End_Of_Nightmare.jpg"
    		},
    		{
    			id: 5,
    			name: 'Raid of Dream',
    			date: 'September 18, 2019',
    			cover: "Raid_of_Dream.png"
    		},
    		{
    			id: 6,
    			name: 'Dystopia: Lose Myself',
    			date: 'Aug 17, 2020',
    			cover: "Dystopia_Lose_Myself.jpg"
    		},
    		{
    			id: 7,
    			name: 'Dystopia : Road to Utopia',
    			date: 'January 26, 2021',
    			cover: "Dystopia_Road_to_Utopia.jpg"
    		},
    		{
    			id: 8,
    			name: 'Summer Holiday',
    			date: 'July 30, 2021 ',
    			cover: "Summer_Holiday.jpg"
    		}
    	];

    	const SingleAlbums = [
    		{
    			id: 1,
    			name: 'Nightmare',
    			date: 'January 13, 2017',
    			cover: "Nightmare.png"
    		},
    		{
    			id: 2,
    			name: 'Fall Asleep in the Mirror',
    			date: 'April 5, 2017',
    			cover: "Fall_Asleep_in_The_Mirror.png"
    		},
    		{
    			id: 3,
    			name: 'What (Japanese Ver.)',
    			date: 'November 21, 2018',
    			cover: "What_Japanese.png"
    		},
    		{
    			id: 4,
    			name: 'Piri ~ Fue wo Fuke ~',
    			date: 'March 13, 2019',
    			cover: "PIRI_Japanese.jpg"
    		},
    		{
    			id: 5,
    			name: 'Endless Night',
    			date: ' March 11, 2020',
    			cover: "Endless_Night.jpg"
    		},
    		{
    			id: 6,
    			name: 'Eclipse',
    			date: ' March 24, 2021.',
    			cover: "Eclipse.png"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Discography> was created with unknown prop '${key}'`);
    	});

    	function tabs_activeTabValue_binding(value) {
    		currentTab = value;
    		$$invalidate(0, currentTab);
    	}

    	$$self.$capture_state = () => ({
    		Tabs,
    		tabItems,
    		currentTab,
    		StudioAlbums,
    		MiniAlbums,
    		SingleAlbums
    	});

    	$$self.$inject_state = $$props => {
    		if ('tabItems' in $$props) $$invalidate(1, tabItems = $$props.tabItems);
    		if ('currentTab' in $$props) $$invalidate(0, currentTab = $$props.currentTab);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		currentTab,
    		tabItems,
    		StudioAlbums,
    		MiniAlbums,
    		SingleAlbums,
    		tabs_activeTabValue_binding
    	];
    }

    class Discography extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Discography",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\Media.svelte generated by Svelte v3.48.0 */

    const file$1 = "src\\components\\Media.svelte";

    function create_fragment$1(ctx) {
    	let div6;
    	let h10;
    	let t0;
    	let hr0;
    	let t1;
    	let div1;
    	let img;
    	let img_src_value;
    	let t2;
    	let div0;
    	let a;
    	let span;
    	let t3;
    	let div3;
    	let div2;
    	let button;
    	let t4;
    	let iframe0;
    	let iframe0_src_value;
    	let t5;
    	let h11;
    	let t7;
    	let div5;
    	let h12;
    	let t8;
    	let hr1;
    	let t9;
    	let div4;
    	let iframe1;
    	let iframe1_src_value;

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			h10 = element("h1");
    			t0 = text("Latest Music video");
    			hr0 = element("hr");
    			t1 = space();
    			div1 = element("div");
    			img = element("img");
    			t2 = space();
    			div0 = element("div");
    			a = element("a");
    			span = element("span");
    			t3 = space();
    			div3 = element("div");
    			div2 = element("div");
    			button = element("button");
    			t4 = space();
    			iframe0 = element("iframe");
    			t5 = space();
    			h11 = element("h1");
    			h11.textContent = "(ENG) Dreamcatcher(드림캐쳐) 'MAISON' MV";
    			t7 = space();
    			div5 = element("div");
    			h12 = element("h1");
    			t8 = text("Listen To Dreamcatcher");
    			hr1 = element("hr");
    			t9 = space();
    			div4 = element("div");
    			iframe1 = element("iframe");
    			attr_dev(hr0, "class", "svelte-j37mtq");
    			add_location(hr0, file$1, 8, 44, 109);
    			attr_dev(h10, "class", "video-header svelte-j37mtq");
    			add_location(h10, file$1, 8, 1, 66);
    			if (!src_url_equal(img.src, img_src_value = "../img/group-white-min.jpg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$1, 10, 13, 167);
    			attr_dev(span, "uk-icon", "play-circle");
    			add_location(span, file$1, 12, 57, 311);
    			attr_dev(a, "href", "#modal-media-video");
    			attr_dev(a, "uk-toggle", "");
    			attr_dev(a, "class", "svelte-j37mtq");
    			add_location(a, file$1, 12, 18, 272);
    			attr_dev(div0, "class", "uk-position-center");
    			add_location(div0, file$1, 11, 13, 220);
    			attr_dev(div1, "class", "uk-inline uk-dark");
    			add_location(div1, file$1, 9, 1, 121);
    			attr_dev(button, "class", "uk-modal-close-outside");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "uk-close", "");
    			add_location(button, file$1, 18, 9, 527);
    			attr_dev(iframe0, "width", "784");
    			attr_dev(iframe0, "height", "441");
    			if (!src_url_equal(iframe0.src, iframe0_src_value = "https://www.youtube.com/embed/z4t9LLq1Nk0")) attr_dev(iframe0, "src", iframe0_src_value);
    			attr_dev(iframe0, "title", "(ENG) Dreamcatcher(드림캐쳐) 'MAISON' MV");
    			attr_dev(iframe0, "frameborder", "0");
    			attr_dev(iframe0, "allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
    			iframe0.allowFullscreen = true;
    			attr_dev(iframe0, "controls", "");
    			attr_dev(iframe0, "playsinline", "");
    			attr_dev(iframe0, "uk-video", "");
    			add_location(iframe0, file$1, 19, 9, 609);
    			attr_dev(div2, "class", "uk-modal-dialog uk-width-auto uk-margin-auto-vertical");
    			add_location(div2, file$1, 17, 5, 449);
    			attr_dev(div3, "id", "modal-media-video");
    			attr_dev(div3, "class", "uk-flex-top");
    			attr_dev(div3, "uk-modal", "");
    			add_location(div3, file$1, 16, 1, 385);
    			attr_dev(h11, "class", "svelte-j37mtq");
    			add_location(h11, file$1, 22, 1, 929);
    			attr_dev(hr1, "class", "svelte-j37mtq");
    			add_location(hr1, file$1, 24, 53, 1055);
    			attr_dev(h12, "class", "streaming-header svelte-j37mtq");
    			add_location(h12, file$1, 24, 2, 1004);
    			if (!src_url_equal(iframe1.src, iframe1_src_value = "https://open.spotify.com/embed/artist/5V1qsQHdXNm4ZEZHWvFnqQ?utm_source=generator")) attr_dev(iframe1, "src", iframe1_src_value);
    			attr_dev(iframe1, "width", "80%");
    			attr_dev(iframe1, "height", "380");
    			attr_dev(iframe1, "frameborder", "0");
    			iframe1.allowFullscreen = "";
    			attr_dev(iframe1, "allow", "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture");
    			add_location(iframe1, file$1, 26, 3, 1117);
    			attr_dev(div4, "class", "spotify uk-flex uk-flex-center");
    			add_location(div4, file$1, 25, 2, 1068);
    			attr_dev(div5, "class", "streaming");
    			add_location(div5, file$1, 23, 1, 977);
    			attr_dev(div6, "class", "video svelte-j37mtq");
    			add_location(div6, file$1, 7, 0, 44);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, h10);
    			append_dev(h10, t0);
    			append_dev(h10, hr0);
    			append_dev(div6, t1);
    			append_dev(div6, div1);
    			append_dev(div1, img);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, a);
    			append_dev(a, span);
    			append_dev(div6, t3);
    			append_dev(div6, div3);
    			append_dev(div3, div2);
    			append_dev(div2, button);
    			append_dev(div2, t4);
    			append_dev(div2, iframe0);
    			append_dev(div6, t5);
    			append_dev(div6, h11);
    			append_dev(div6, t7);
    			append_dev(div6, div5);
    			append_dev(div5, h12);
    			append_dev(h12, t8);
    			append_dev(h12, hr1);
    			append_dev(div5, t9);
    			append_dev(div5, div4);
    			append_dev(div4, iframe1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Media', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Media> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Media extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Media",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.48.0 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let hero;
    	let t0;
    	let div3;
    	let div0;
    	let h10;
    	let t2;
    	let hr0;
    	let t3;
    	let profile;
    	let t4;
    	let div1;
    	let h11;
    	let t6;
    	let hr1;
    	let t7;
    	let discography;
    	let t8;
    	let div2;
    	let h12;
    	let t10;
    	let hr2;
    	let t11;
    	let media;
    	let t12;
    	let footer;
    	let current;
    	hero = new Hero({ $$inline: true });
    	profile = new Profile({ $$inline: true });
    	discography = new Discography({ $$inline: true });
    	media = new Media({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(hero.$$.fragment);
    			t0 = space();
    			div3 = element("div");
    			div0 = element("div");
    			h10 = element("h1");
    			h10.textContent = "PROFILE";
    			t2 = space();
    			hr0 = element("hr");
    			t3 = space();
    			create_component(profile.$$.fragment);
    			t4 = space();
    			div1 = element("div");
    			h11 = element("h1");
    			h11.textContent = "DISCOGRAPHY";
    			t6 = space();
    			hr1 = element("hr");
    			t7 = space();
    			create_component(discography.$$.fragment);
    			t8 = space();
    			div2 = element("div");
    			h12 = element("h1");
    			h12.textContent = "Media";
    			t10 = space();
    			hr2 = element("hr");
    			t11 = space();
    			create_component(media.$$.fragment);
    			t12 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(h10, "class", "section-header uk-text-bold svelte-174v2kw");
    			add_location(h10, file, 15, 3, 362);
    			attr_dev(hr0, "class", "uk-divider-icon");
    			add_location(hr0, file, 16, 3, 418);
    			attr_dev(div0, "class", "section svelte-174v2kw");
    			attr_dev(div0, "id", "profile");
    			add_location(div0, file, 14, 2, 324);
    			attr_dev(h11, "class", "section-header uk-text-bold svelte-174v2kw");
    			add_location(h11, file, 21, 3, 599);
    			attr_dev(hr1, "class", "uk-divider-icon");
    			add_location(hr1, file, 22, 3, 659);
    			attr_dev(div1, "class", "section svelte-174v2kw");
    			attr_dev(div1, "id", "discography");
    			attr_dev(div1, "uk-scrollspy", "cls: uk-animation-fade; target: .uk-card; delay: 200; repeat: false");
    			add_location(div1, file, 20, 2, 474);
    			attr_dev(h12, "class", "section-header uk-text-bold svelte-174v2kw");
    			add_location(h12, file, 28, 3, 832);
    			attr_dev(hr2, "class", "uk-divider-icon");
    			add_location(hr2, file, 29, 3, 886);
    			attr_dev(div2, "class", "section svelte-174v2kw");
    			attr_dev(div2, "id", "media");
    			attr_dev(div2, "uk-scrollspy", "cls: uk-animation-slide-bottom; delay: 200; repeat: false");
    			add_location(div2, file, 27, 2, 722);
    			attr_dev(div3, "class", "content svelte-174v2kw");
    			add_location(div3, file, 12, 1, 299);
    			attr_dev(main, "class", "svelte-174v2kw");
    			add_location(main, file, 10, 0, 281);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(hero, main, null);
    			append_dev(main, t0);
    			append_dev(main, div3);
    			append_dev(div3, div0);
    			append_dev(div0, h10);
    			append_dev(div0, t2);
    			append_dev(div0, hr0);
    			append_dev(div0, t3);
    			mount_component(profile, div0, null);
    			append_dev(div3, t4);
    			append_dev(div3, div1);
    			append_dev(div1, h11);
    			append_dev(div1, t6);
    			append_dev(div1, hr1);
    			append_dev(div1, t7);
    			mount_component(discography, div1, null);
    			append_dev(div3, t8);
    			append_dev(div3, div2);
    			append_dev(div2, h12);
    			append_dev(div2, t10);
    			append_dev(div2, hr2);
    			append_dev(div2, t11);
    			mount_component(media, div2, null);
    			append_dev(main, t12);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hero.$$.fragment, local);
    			transition_in(profile.$$.fragment, local);
    			transition_in(discography.$$.fragment, local);
    			transition_in(media.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hero.$$.fragment, local);
    			transition_out(profile.$$.fragment, local);
    			transition_out(discography.$$.fragment, local);
    			transition_out(media.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(hero);
    			destroy_component(profile);
    			destroy_component(discography);
    			destroy_component(media);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Hero,
    		Profile,
    		Discography,
    		Media,
    		Footer
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map

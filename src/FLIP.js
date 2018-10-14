function FLIP() {
    let isCreated = false
    const flip = {previous: {}, current: {}}

    return {

        onbeforeupdate(current, previous) {
            flip.previous = {children: previous.children}
            flip.current = {children: current.children}
        },

        view(v) {
            first(v)
            return v.children
        },

        oncreate: v => {
            isCreated = true
            flip.previous = {children: []}
            flip.current = {children: v.children}
            first(v)
            last()
            invert()
            play(v)
        },

        onupdate: v => {
            last()
            invert()
            play(v)

        },
    }

    function first(v) {

        if(!isCreated) return

        // Here we create the flip.boundingClients map by key with:
        //   { <key>: {previous: {}}
        //
        flip.boundingClients = flip.previous.children.reduce((obj, it) => {
            obj[it.key] = {previous: it.dom.getBoundingClientRect()}
            obj[it.key].vnode = it

            return obj
        }, {})

        // Now let's set current keys so we can identify removes
        // it.dom is undefined on current because first() is called from view()
        // Calling from view() is required so that onbeforeremove() can be assigned on removed keys
        flip.current.children.reduce((obj, it) => {

            // This is a new vnode, { <key>: {current: {}}
            if (!obj[it.key]) {
                obj[it.key] = {current: undefined}
            } else { // This is an existing { <key>: {previous: {}} that was established in first()
                obj[it.key].current = undefined
            }

            return obj

        }, flip.boundingClients)

        // Here we'll handle removes.
        // We need to add this in first() because onbeforeremove
        // needs to be set before view() is called.
        // A key with { <key>: {previous: {}} and no current attr is a remove.
        Object.values(flip.boundingClients)
            .filter((it) => it.previous && !it.hasOwnProperty('current'))
            .filter((it) => v.attrs && v.attrs.hasOwnProperty('exit'))
            .forEach((it) => {
                const {dom} = it.vnode
                const {exit} = v.attrs
                it.vnode.attrs = it.vnode.attrs || {}

                Object.assign(it.vnode.attrs, {}, {
                    onbeforeremove: vnodeChild => {
                        // Call the FLIP component's user defined exit() function with this child vnode.
                        // exit() should return a Promise which will be the returned Promise of onbeforeremove.
                        return exit.call(null, it.vnode, flip)
                    }
                })
            })
    }

    // Here we'll look at current and map to an existing key if existed in first():
    // We'll end up with the following by key
    //   { <key>: {previous: {}, current: {}}  -> move
    //   { <key>: {current: {}}                -> enter
    //   { <key>: {previous: {}}               -> exit
    //
    // This is called from the FLIP component's onupdate(), therefore current's dom nodes are now set.
    function last() {
        if (!flip.boundingClients || !flip.current.children)
            return {}

        flip.current.children.reduce((obj, it) => {

            obj[it.key].current = it.dom.getBoundingClientRect()
            obj[it.key].vnode = it

            return obj

        }, flip.boundingClients)

    }

    function invert() {
        Object.values(flip.boundingClients).forEach(it => {
            if (!it.current || !it.previous) {
                it.diff = false
                return
            }

            it.deltaY = it.previous.top - it.current.top
            it.deltaX = it.previous.left - it.current.left
            it.diff = !(it.deltaY === 0 && it.deltaX === 0)
        })
    }

    function play(v) {

        Object.values(flip.boundingClients).forEach((it, i) => {

            if (!it.vnode) {
                console.error('no vnode', flip.boundingClients[i], it)
                return
            }

            const {dom} = it.vnode
            const {enter, exit, move, enterfinish} = v.attrs

            if (enter && (it.current && !it.previous)) {
                // Call the FLIP component's user defined enter() function with this child vnode.
                enter.call(null, it.vnode, flip)
            } else if (move && (it.diff && it.current && it.previous)) {
                // Call the FLIP component's user defined move() function with this child vnode.
                move.call(null, it.vnode, flip)
            }

        })

    }

}

// Convenience utility to convert a string into a list.
// e.g. the string "ABCB" results in:
// {key: "A0", letter: "A"}
// {key: "B0", letter: "B"}
// {key: "C0", letter: "C"}
// {key: "B1", letter: "B"}
// You then can use this result to create vnode children as a keyed list for animating strings.
FLIP.letterKeys = function letterMap(string) {
    let letterMap = Array.from(string).reduce((obj, item) => {

        if (!obj[item]) {
            obj[item] = {count: 0}
        } else {
            obj[item].count++
        }
        let key = item + obj[item].count
        obj.asList.push({key: key, letter: item})
        return obj

    }, {asList: []})

    return letterMap.asList

}

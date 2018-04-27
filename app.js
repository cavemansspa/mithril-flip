var KeyedList = function (vnode) {

    return {

        view: function (vnode) {

            let data = vnode.attrs.data

            return m('', {
                    style: {display: 'flex'}
                }, [
                    m('ul', {style: {flex: '50%', 'overflow': 'hidden'}},
                        m(FLIP, {
                                enter: (vnodeChild, flip) => {
                                    console.log('enter()', vnodeChild, flip)
                                    var anim = [
                                        {transform: 'translate3d(0,-100%,0)', opacity: 0},
                                        {transform: 'none', opacity: 1},
                                    ]

                                    var waapi = vnodeChild.dom.animate(anim, {
                                        duration: 1000,
                                    })

                                    waapi.onfinish = (e) => {
                                        console.log('finished enter()')
                                    }
                                },

                                move: (vnodeChild, flip) => {
                                    console.log('move()', vnodeChild, flip)
                                    let flipBounding = flip.boundingClients[vnodeChild.key],
                                        diff = flipBounding.deltaY,
                                        anim = [
                                            {transform: 'translate3d(0,' + diff + 'px,0)', opacity: 0},
                                            {transform: 'translate3d(0,0,0)', opacity: 1},
                                        ]

                                    let waapi = vnodeChild.dom.animate(anim, {
                                        duration: 1000,
                                    })

                                    waapi.onfinish = (e) => {
                                        console.log('finished move()')
                                    }
                                },

                                exit: (vnodeChild, flip) => {
                                    console.log('exit()', vnodeChild, flip)
                                    let anim = [
                                        {transform: 'none', opacity: 1},
                                        {transform: 'translate3d(25%,100%,0)', opacity: 0},
                                    ]
                                    let waapi = vnodeChild.dom.animate(anim, {
                                        duration: 1000,
                                    })

                                    return new Promise((resolve) => {
                                        waapi.onfinish = function (e) {
                                            console.log('finished exit()')
                                            resolve()
                                        }
                                    })
                                },
                            },
                            Array.from(data).map(listItem)
                        )),
                    m('ul', {style: {flex: '50%', 'overflow': 'hidden'}},
                        Array.from(data).map(listItem)
                    )
                ]
            )

        }
    }

    function listItem(dataItem) {
        return m('li', {key: dataItem}, dataItem)
    }

}

var values = new Set([
    1, 2, 3
])

m.mount(document.body, {

    oninit: function (vnode) {
        console.log('main::oninit')
    },

    view: (vnode) => {
        //console.log('main::view')

        return [
            m('div', [
                    m('button', {
                        onclick: () => {
                            let nextInt = Math.max.apply(null, Array.from(values)) + 1
                            if (nextInt === -Infinity) {
                                values = new Set([1])
                                return
                            }
                            values.add(nextInt)
                        }
                    }, 'Add'),
                    m('button', {
                        onclick: () => {
                            let maxInt = Math.max.apply(null, Array.from(values))
                            values.delete(maxInt)
                        }
                    }, 'Remove'),
                    m('button', {
                        onclick: () => {
                            shuffleValues()
                        }
                    }, 'Shuffle')
                ]
            ),
            m(KeyedList, {data: values}),
        ]

        function shuffleValues() {
            let array = Array.from(values)
            for (let i = array.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            values = new Set(array)
        }
    }
})
var KeyedList = function (vnode) {

    return {

        view: function (vnode) {

            let data = vnode.attrs.data

            view: return m('', {}, [
                    m('div', {style: {display: 'flex', 'overflow': 'hidden'}},
                        m(FLIP, {
                                move: (vnodeChild, flip) => {
                                    console.log('move()', vnodeChild, flip)
                                    let flipBounding = flip.boundingClients[vnodeChild.key]
                                    let diff = flipBounding.deltaX
                                    let anim = [
                                        {transform: 'translate3d(' + diff + 'px,0,0)'},
                                        {transform: 'translate3d(0,0,0)'},
                                    ]

                                    var waapi = vnodeChild.dom.animate(anim, {
                                        duration: 1000,
                                    })
                                    waapi.onfinish = (e) => {
                                        console.log('finished')
                                    }

                                }
                            },
                            listItem(data)
                        )
                    )
                ]
            )
        }
    }

    function listItem(strData) {
        var letterKeys = FLIP.letterKeys(strData)
        return Array.from(letterKeys).map((dataItem, i) => {
                return m('div', {key: dataItem.key}, dataItem.letter)

            }
        )
    }

}

var values = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
]
var currentIndex = 0

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
                            if (currentIndex === values.length - 1) {
                                currentIndex = 0
                            } else {
                                currentIndex++
                            }
                            console.log(values.length, currentIndex)
                        }
                    }, 'Click'),

                ]
            ),
            m(KeyedList, {data: values[currentIndex].toUpperCase()}),
        ]


    }
})
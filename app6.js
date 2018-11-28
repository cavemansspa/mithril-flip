const layout = (cmp, attrs) => {

    let onEnterData = undefined

    return {

        onmatch: () => {
            console.log('layout::onmatch')
        },

        render: () => {

            return m('div', {style: 'height: 300px;overflow: hidden;'}, [
                    'header w/ single oninit',
                    m('.container', {style: 'width:100%;display:flex;flex-wrap:nowrap'},
                        m(FLIP, {
                            oninit: () => console.log('FLIP::oninit'),

                            enter: (vnodeChild, flip) => {
                                console.log('enter', onEnterData)

                                if (onEnterData) {
                                    let enterData = onEnterData(),
                                        outboundKey = enterData.vnodeChildExit.key,
                                        inboundKey = vnodeChild.key,

                                        boundingClients = flip.boundingClients,
                                        boundingOutbound = boundingClients[outboundKey].previous,
                                        boundingInbound = boundingClients[inboundKey].current,

                                        inBound = vnodeChild,
                                        outBound = enterData.vnodeChildExit

                                    let delta = FLIP.delta(boundingOutbound, boundingInbound)

                                    if(m.route.get() === '/first') {
                                        requestAnimationFrame(() => {
                                            requestAnimationFrame(() => {
                                                outBound.dom.style.transform = delta.toTranslate3d()
                                                inBound.dom.style.transform = delta.toTranslate3d()
                                                outBound.dom.style.transition = 'transform 300ms'
                                                inBound.dom.style.transition = 'transform 300ms'
                                                outBound.dom.addEventListener('transitionend', () => {
                                                    inBound.dom.style.transform = ''
                                                    inBound.dom.style.transition = ''
                                                    enterData.resolve()
                                                })
                                            })
                                        })

                                    } else {

                                        let inDelta = FLIP.delta(boundingOutbound, boundingInbound)
                                        let outDelta = FLIP.delta(boundingInbound, boundingOutbound)
                                        inDelta.deltaX *= 2
                                        inBound.dom.style.transform = inDelta.toTranslate3d()
                                        requestAnimationFrame(() => {
                                            requestAnimationFrame(() => {
                                                inDelta.deltaX /= 2
                                                inBound.dom.style.transform = inDelta.toTranslate3d()
                                                outBound.dom.style.transform = outDelta.toTranslate3d()
                                                outBound.dom.style.transition = 'transform 300ms'
                                                inBound.dom.style.transition = 'transform 300ms'
                                                outBound.dom.addEventListener('transitionend', () => {
                                                    inBound.dom.style.transform = ''
                                                    inBound.dom.style.transition = ''
                                                    enterData.resolve()
                                                })
                                            })
                                        })

                                    }

                                }
                            },

                            exit: (vnodeChild, flip) => {
                                console.log('exit()', vnodeChild, flip)
                                return setUpPromise(vnodeChild, flip)
                            }

                        }, [
                            m('div', {
                                key: attrs.pagekey,
                                style: Object.assign({}, attrs.style, {flex: '0 0 100%'}),
                                oninit: () => console.log('layout::oninit'),
                            }, [
                                m('h1', 'Routed Page Header'),
                                m('ul', ['/first', '/second'].filter(route => {
                                        return m.route.get() !== route
                                    }).map(route => m('li', m('a', {
                                        href: route,
                                        oncreate: m.route.link
                                    }, route)))
                                ),

                                m(cmp, attrs)

                            ])
                        ])),
                    'footer w/ single oninit'
                ]
            )
        }
    }

    function setUpPromise(vnodeChild) {
        return new Promise((resolve) => {
            onEnterData = () => {
                return {
                    resolve: resolve,
                    vnodeChildExit: vnodeChild
                }
            }
        })
    }

}

const Cmp = {
    oninit: () => console.log('Cmp::oninit'),
    view: vnode => m('h2', vnode.attrs.title)
}

m.route(document.body, '/first', {
    '/first': layout(Cmp, {pagekey: 1, title: 'First Route', style: {backgroundColor: 'aliceblue'}}),
    '/second': layout(Cmp, {pagekey: 2, title: 'Second Route', style: {backgroundColor: 'beige'}})
})
export default {
    "name":"sample",
    "author":"iAuthor",
    "componentLibs":[
        "@reactackle/reactackle@0.1.0-dev124"
    ],
    "relayEndpointURL":null,
    "routes":[
        {
            "id": 0,
            "path": "/",
            "component": {
                "name": "Reactackle.App",
                "uid": "cmVnaW9uOjA=",
                "props": {},
                "children": [{
                    "uid": "...",
                    "name": "Outlet",
                    "title": "...",
                    "props": {},
                    "children": []
                }]
            },
            "children": [
                {
                    "id": 1,
                    "path": "page1",
                    "children": [
                        {
                            "id": 2,
                            "path": "sub",
                            "children": [],
                            "component": {
                                "name": "Reactackle.Card",
                                "uid": "cmVnaW9uOjE=",
                                "props": {},
                                "children": [
                                    {
                                        "name": "Reactackle.Input",
                                        "uid": "Y29udHJvbDox",
                                        "children": [],
                                        "props": {
                                            "value": {
                                                "source": "static",
                                                "sourceData": {
                                                    "value": "TEST1"
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "name": "Reactackle.Input",
                                        "uid": "Y29udHJvbDoy",
                                        "children": [],
                                        "props": {
                                            "value": {
                                                "source": "static",
                                                "sourceData": {
                                                    "value": "TEST2"
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "name": "Reactackle.Input",
                                        "uid": "Y29udHJvbDo0",
                                        "children": [],
                                        "props": {
                                            "value": {
                                                "source": "static",
                                                "sourceData": {
                                                    "value": "TEST2"
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    ],
                    "component": {
                        "name": "Reactackle.Card",
                        "uid": "cmVnaW9uOjI=",
                        "props": {},
                        "children": [{
                            "uid": "...",
                            "name": "Outlet",
                            "title": "...",
                            "props": {},
                            "children": []
                        }]
                    }
                },
                {
                    "id": 3,
                    "path": "page2",
                    "children": [],
                    "component": {
                        "name": "Reactackle.Radio",
                        "uid": "Y29udHJvbDoz",
                        "props": {
                            "checked": {
                                "source": "static",
                                "sourceData": {
                                    "value": true
                                }
                            }
                        },
                        "children": []
                    }
                }
            ]
        }
    ]
}
export default {
    "name": "Sample Project",
    "author": "iAuthor",
    "componentLibs": ["@reactackle/reactackle"],
    "relayEndpointURL": "",
    "routes": [
        {
            "id": "0",
            "path": "/",
            "component": {
                "name": "Reactackle.App",
                "uid": "cmVnaW9uOjA=",
                "props": {},
                "children": ["outlet"]
            },
            "children": [
                {
                    "id": "1",
                    "path": "page1",
                    "children": [
                        {
                            "id": "2",
                            "path": "sub",
                            "children": [],
                            "component": {
                                "name": "Reactackle.Card",
                                "uid": "cmVnaW9uOjE=",
                                "props": {},
                                "children": [
                                    {
                                        "name": "Reactackle.Card",
                                        "uid": "cmVnaW9uOjE7",
                                        "props": {},
                                        "children": [
                                            {
                                                "name": "Reactackle.Timepicker",
                                                "uid": "Y29udHJvbDo2",
                                                "props": {}
                                            }
                                        ]
                                    },
                                    {
                                        "name": "Reactackle.Input",
                                        "uid": "Y29udHJvbDox",
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
                        "children": ["outlet"]
                    }
                },
                {
                    "id": "3",
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
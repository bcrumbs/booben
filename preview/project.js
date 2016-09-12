export default {
    "name": "Sample Project",
    "author": "iAuthor",
    "componentLibs": ["@reactackle/reactackle"],
    "relayEndpointURL": "",
    "routes": [
        {
            "path": "/",
            "component": {
                "name": "Reactackle.App",
                "props": {},
                "children": ["outlet"]
            },
            "children": [
                {
                    "path": "page1",
                    "children": [
                        {
                            "path": "sub",
                            "children": [],
                            "component": {
                                "name": "Reactackle.Card",
                                "props": {},
                                "children": [
                                    {
                                        "name": "Reactackle.Input",
                                        "props": {
                                            "source": "static",
                                            "sourceData": {
                                                "SourceDataStatic": {
                                                    "value": "TEST"
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
                        "props": {
                            "source": "static",
                            "sourceData": {
                                "SourceDataStatic": {}
                            }
                        },
                        "children": ["outlet"]
                    }
                },
                {
                    "path": "page2",
                    "children": [],
                    "component": {
                        "name": "Reactackle.Radio",
                        "props": {
                            "source": "static",
                            "sourceData": {
                                "SourceDataStatic": {}
                            }
                        },
                        "children": []
                    }
                }
            ]
        }
    ]
}
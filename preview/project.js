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
                "componentType": "region",
                "uid": "cmVnaW9uOjA=",
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
                                "uid": "cmVnaW9uOjE=",
                                "componentType": "region",
                                "props": {},
                                "children": [
                                    {
                                        "name": "Reactackle.Card",
                                        "uid": "cmVnaW9uOjE7",
                                        "componentType": "region",
                                        "props": {},
                                        "children": [
                                            {
                                                "name": "Reactackle.Timepicker",
                                                "componentType": "control",
                                                "uid": "Y29udHJvbDo2",
                                                "props": {
                                                    "source": "static",
                                                    "sourceData": {
                                                        "SourceDataStatic": {}
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "name": "Reactackle.Input",
                                        "componentType": "control",
                                        "uid": "Y29udHJvbDox",
                                        "props": {
                                            "source": "static",
                                            "sourceData": {
                                                "SourceDataStatic": {
                                                    "value": "TEST1"
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "name": "Reactackle.Input",
                                        "componentType": "control",
                                        "uid": "Y29udHJvbDoy",
                                        "props": {
                                            "source": "static",
                                            "sourceData": {
                                                "SourceDataStatic": {
                                                    "value": "TEST2"
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "name": "Reactackle.Input",
                                        "componentType": "control",
                                        "uid": "Y29udHJvbDo0",
                                        "props": {
                                            "source": "static",
                                            "sourceData": {
                                                "SourceDataStatic": {
                                                    "value": "TEST3"
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
                        "componentType": "region",
                        "uid": "cmVnaW9uOjI=",
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
                        "componentType": "control",
                        "uid": "Y29udHJvbDoz",
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
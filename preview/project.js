export default {
    "name": "Sample Project",
    "author": "iAuthor",
    "componentLibs": ["@reactackle/reactackle"],
    "relayEndpointURL": "",
    "routes": [
        {
            "path": "/",
            "components": [
                {
                    "name": "App",
                    "props": {},
                    "children": ["outlet"]
                }
            ],
            "children": [
                {
                    "path": "page1",
                    "children": [
                        {
                            "path": "sub",
                            "children": [],
                            "components": [
                                {
                                    "name": "Datepicker",
                                    "props": {
                                        "source": "static",
                                        "sourceData": {
                                            "SourceDataStatic": {}
                                        }
                                    },
                                    "children": []
                                },
                                {
                                    "name": "Radio",
                                    "props": {
                                        "source": "static",
                                        "sourceData": {
                                            "SourceDataStatic": {
                                                "checked": true
                                            }
                                        }
                                    },
                                    "children": []
                                }
                            ]
                        }
                    ],
                    "components": [
                        {
                            "name": "Card",
                            "props": {
                                "source": "static",
                                "sourceData": {
                                    "SourceDataStatic": {}
                                }
                            },
                            "children": ["outlet"]
                        }
                    ]
                },
                {
                    "path": "page2",
                    "children": [],
                    "components": [
                        {
                            "name": "Datepicker",
                            "props": {
                                "source": "static",
                                "sourceData": {
                                    "SourceDataStatic": {}
                                }
                            },
                            "children": []
                        }
                    ]
                }
            ]
        }
    ]
}
export default {
    "name": "Sample Project",
    "author": "iAuthor",
    "componentLibs": ["@reactackle/reactackle"],
    "relayEndpointURL": "",
    "routes": [
        {
            "path": "/",
            "component": {
                "name": "App",
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
                                "name": "Datepicker",
                                "props": {},
                                "children": []
                            }
                        }
                    ],
                    "component": {
                        "name": "Card",
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
                        "name": "Radio",
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
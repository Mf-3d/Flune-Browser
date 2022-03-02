# Flune-Browser
c.Monotの後継のRuna-Browserの後継。
![image](https://user-images.githubusercontent.com/84224913/156182326-55cc3fbd-5a7c-4901-922b-7c4df55d7468.png)

Flune-Browser 1.0.0 Alpha 3以降ではSorakimeさんのMonot 1.0.0 Beta 6のコードを使用しています。

Copyright 2022 mf7cli.
Licensed by [monochrome License V2.](https://sorakime.github.io/mncr/license?v=2.0.0)

## テーマの作り方 - Flune-Browser 1.1.0~
    まず「theme.json」を作ります。

    「theme.json」にはテキストエディタなどで、

    ```json
    {
        "theme": {
            "name": "テーマの名前",
            "version": "バージョン",
            "theme_loader_version": "1.0.0",
            "description": "説明",
            "author": "製作者の名前",
            "nav": {
                "html_mac": "macOS版のナビゲーションメニューのHTMLのパス",
                "html_win": "Windows版のナビゲーションメニューのHTMLのパス",
                "html_linux": "Linux版のナビゲーションメニューのHTMLのパス"
            },
            "start": {
                "html": "スタートした時、新規タブを開いた時のHTMLのパス"
            }
        }
    }
    ```
    と書いておきましょう。
    
    一つでもないと動かない可能性があります。
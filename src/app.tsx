import {Router} from "@solidjs/router";
import {FileRoutes} from "@solidjs/start/router";
import {Suspense} from "solid-js";
import "./app.css";
import {MetaProvider} from "@solidjs/meta";
import {isServer} from "solid-js/web"

import {ColorModeProvider, ColorModeScript, cookieStorageManagerSSR} from "@kobalte/core"
import {getCookie} from "vinxi/http"

import "@fontsource/inter"
import "./app.css"
import {Navbar} from "~/components/navbar";
import {Footer} from "~/components/footer";

function getServerCookies() {
    "use server"
    const colorMode = getCookie("kb-color-mode")
    return colorMode ? `kb-color-mode=${colorMode}` : ""
}

export default function App() {
    const storageManager = cookieStorageManagerSSR(isServer ? getServerCookies() : document.cookie)

    return (
        <MetaProvider>
            <Router
                root={props => (
                    <>
                        <ColorModeScript storageType={storageManager.type}/>
                        <ColorModeProvider storageManager={storageManager}>
                            <Suspense>
                                <Navbar/>
                                    {props.children}
                                <Footer/>

                            </Suspense>
                        </ColorModeProvider>
                    </>
                )}
            >
                <FileRoutes/>

            </Router>
        </MetaProvider>
    );
}

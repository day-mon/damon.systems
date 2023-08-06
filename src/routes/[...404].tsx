import {A} from "solid-start";
import {createEffect, For} from "solid-js";
import PAGES from "~/constants";

export default function NotFound() {
    createEffect(() => {
        document.title = "damon | 404"
    })
    return (
        <main class='flex flex-col items-center justify-center h-[85vh] overflow-hidden space-y-6'>
            <h1 class='text-6xl font-bold'>404</h1>
            <h2 class='text-3xl'>Page Not Found</h2>
        </main>
    );
}
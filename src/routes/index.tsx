import {For} from "solid-js";
import {Meta, Title} from "@solidjs/meta";
import {PAGES} from "~/constants";

export default function Home() {
    return (
        <>
            <Title>damon</Title>
            <Meta property="og:title" content="damon" />
            <Meta property="og:url" content="https://damon.systems" />
            <Meta property="og:image" content="/think.png" />
            <Meta property="og:type" content="website" />
            <Meta property="og:site_name" content="damon" />
            <Meta property="og:locale" content="en_US" />

            <main class="flex flex-col items-center justify-center h-screen p-6 animate-fade-in">
                <div class="mb-12 text-center">
                    <h1 class="text-4xl mb-1 font-light">damon</h1>
                    <p class="text-sm opacity-70">software engineer</p>
                </div>
                
                <nav class="w-full max-w-xs">
                    <ul class="space-y-5 text-xl">
                        <For each={PAGES}>{(page) => {
                            if (page.path === "") return <></>;
                            
                            return (
                                <li class="transition-all duration-300 border-b border-opacity-10 pb-2">
                                    <a href={`/${page.path}`} class="block w-full hover:translate-x-1 transition-transform">
                                        <span class="italic mr-2 opacity-70">/</span>{page.name}
                                    </a>
                                </li>
                            );
                        }}</For>
                    </ul>
                </nav>
            </main>
        </>
    );
}
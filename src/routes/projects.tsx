import {createEffect, createResource, createSignal, For, Show} from "solid-js";
import {Octokit} from "octokit";
import {Meta, Title} from "solid-start";

const octokit = new Octokit();
const excluded_repos = [
    "school-bot",
    "ImageSize",
    "silly-zach",
    "Labs",
    "PittJohnstownAPI",
]
const fetchData = async () => {
    const request = await octokit.request("GET /users/{username}/repos", {
        username: "day-mon",
        type: "owner",
        sort: "updated",
    })
    return request.data
        .filter((repo) => !repo.private)
        .filter((repo) => !repo.fork)
        .filter((repo) => !excluded_repos.includes(repo.name))
        .sort((a, b) => {
            let aStarCount = a.stargazers_count
            let bStarCount = b.stargazers_count
            if (!aStarCount) {
                return 1
            }
            if (!bStarCount) {
                return -1
            }
            return aStarCount === bStarCount ? 0 : aStarCount > bStarCount ? -1 : 1
        })
}


const Projects = () => {
    const [data, {mutate, refetch}] = createResource(fetchData);



    return (
        <>
            <Title>damon | projects</Title>
            <Meta property="og:title" content="damon | projects"/>
            <Meta property="og:description" content="some of the things I have worked on via github"/>
            <Meta property="og:url" content="https://damon.systems/projects"/>
            <Meta property="og:image" content="https://damon.systems/projects.png"/>
            <Meta property="og:type" content="website"/>
            <Meta property="og:site_name" content="damon"/>
            <Meta property="og:locale" content="en_US"/>

            <main
                class="flex justify-center items-center flex-col mb-4 text-center px-4 sm:px-0 space-y-6 animate-fade-in h-[85vh]">
                <Show when={data.loading}>
                    <div class="flex flex-col items-center justify-center space-y-4">
                        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                        <p class="animate-pulse text-lg bg-gray-200 text-black dark:text-white bg-clip-text">loading...</p>
                    </div>
                </Show>
                <Show when={data.error}>
                    <div class="flex flex-col items-center justify-center space-y-4">
                        <h1 class="text-6xl font-bold text-red-500">Error</h1>
                        <p class="text-red-500">{data.error}</p>
                    </div>
                </Show>
                <Show when={!data.loading && !data.error}>
                    <div class="overflow-auto m">
                        <h1 class="text-2xl italic text-center mb-2 font-bold">
                            here are some of the things I have worked on
                        </h1>
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-8">
            <span
                class="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 text-2xl text-end hover:cursor-pointer"
                onClick={() => {
                    sessionStorage.removeItem("projects");
                    refetch();
                }}
            >
              ↻
            </span>
                            <For each={data()}>
                                {(project) => (
                                    <div
                                        class="border-2 border-gray-900 dark:border-white rounded-lg text-center p-4 hover:scale-105 hover:shadow-lg transition-all duration-300 animate-fade-in"
                                    >
                                        <a href={project.html_url} target={"_blank"}
                                           class="text-lg text-center font-bold relative">
                                        <span class="hover-underline dark:hover-underline-white">
                                            {`${project.name.toLowerCase()} ${project.stargazers_count ? `(${project.stargazers_count} ⭐)` : ""}`}
                                        </span>
                                        </a>
                                        <p class="text-center">
                                            {project.description && project.description.toLowerCase() || "no description"}
                                        </p>
                                        <Show when={project.topics && project.topics.length > 0}>
                                            <p class={'text-sm'}>{project.topics?.join(", ")}</p>
                                        </Show>
                                        <Show when={project.language}>
                                            <p class={'text-sm text'}>{project.language?.toLowerCase()}</p>
                                        </Show>
                                    </div>
                                )}
                            </For>
                        </div>
                    </div>
                </Show>
            </main>
        </>
    );
};

export default Projects;
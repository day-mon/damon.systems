import {createEffect, createResource, createSignal, For, Show, Suspense} from "solid-js";
import {ErrorBoundary, Meta, Title} from "solid-start";
import Loading from "~/components/loading";

const excluded_repos = [
    "school-bot",
    "ImageSize",
    "silly-zach",
    "Labs",
    "PittJohnstownAPI",
]
const fetchData = async () => {
    const request = await fetch("https://api.github.com/users/day-mon/repos?per_page=100", {
        headers: {
            'X-Github-Api-Version': '2022-11-28',
        }
    })
    const response = await request.json()
    return response
        .filter((repo: any) => !repo.private)
        .filter((repo: any) => !repo.fork)
        .filter((repo: any) => !excluded_repos.includes(repo.name))
        .sort((a: any, b: any) => {
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

                <ErrorBoundary fallback={() => (
                    <div class="flex flex-col items-center justify-center space-y-4">
                        <h1 class="text-6xl font-bold text-black">Error</h1>
                        <p class="text-black">Something went wrong</p>
                    </div>
                )}>
                    <Suspense fallback={<Loading/>}>
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

                            </div>
                        </div>
                    </Suspense>
                </ErrorBoundary>
            </main>
        </>
    );
};

export default Projects;
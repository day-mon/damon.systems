import {createEffect, createResource, createSignal, ErrorBoundary, For, Show, Suspense} from "solid-js";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "~/components/ui/card";
import {RiSystemExternalLinkLine} from "solid-icons/ri";
import {Tooltip, TooltipContent, TooltipTrigger} from "~/components/ui/tooltip";
import {Meta, Title} from "@solidjs/meta";
import {Loading} from "~/components/loading";
import {IoRefresh} from "solid-icons/io";

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

const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
        "JavaScript": "#f1e05a",
        "TypeScript": "#3178c6",
        "Python": "#3572A5",
        "Java": "#b07219",
        "C#": "#178600",
        "C++": "#f34b7d",
        "HTML": "#e34c26",
        "CSS": "#563d7c",
        "Go": "#00ADD8",
        "Rust": "#dea584",
        "Ruby": "#701516",
        "PHP": "#4F5D95",
    };
    return colors[language] || "#6e7781"; // Default color
};

const Projects = () => {
    const [data, { refetch }] = createResource(fetchData, {
        name: "github-projects",
        initialValue: []
    });

    

    const loadingMessage = () => {
        if (data.loading && data.latest && data.latest.length > 0) {
            return <div class="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">refreshing projects...</div>;
        }
        return null;
    };

    return (
        <>
            <Title>damon | projects</Title>
            <Meta property="og:title" content="damon | projects"/>
            <Meta property="og:description" content="some of the things I have worked on via github"/>
            <Meta property="og:url" content="https://damon.systems/projects"/>
            <Meta property="og:image" content="/projects.png"/>
            <Meta property="og:type" content="website"/>
            <Meta property="og:site_name" content="damon"/>
            <Meta property="og:locale" content="en_US"/>

            <main class="min-h-[85vh] py-8 px-4 sm:px-6 animate-fade-in">
                <ErrorBoundary fallback={() => (
                    <div class="flex flex-col items-center justify-center space-y-4">
                        <h1 class="text-6xl font-bold text-black">Error</h1>
                        <p class="text-black">Something went wrong</p>
                    </div>
                )}>
                    <Suspense fallback={<Loading/>}>
                        <div class="max-w-7xl mx-auto">
                            <div class="flex justify-between items-center mb-8">
                                <h1 class="text-3xl font-bold tracking-tight text-center w-full">
                                    <span class="text-gray-900 dark:text-white lowercase">projects</span>
                                    <span class="block text-lg font-normal mt-1 text-gray-500 dark:text-gray-400 lowercase">
                                        things i've built
                                    </span>
                                </h1>
                                
                                <div class="flex items-center gap-2">
                                    <button 
                                        onClick={() => {
                                            sessionStorage.removeItem("projects");
                                            refetch();
                                        }}
                                        class={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 ${data.loading ? 'animate-spin' : ''}`}
                                        aria-label="Refresh projects"
                                    >
                                        <IoRefresh class="w-5 h-5 block" />
                                    </button>
                                </div>
                            </div>
                            
                            {loadingMessage()}

                            <Show when={data.error}>
                                <div class="text-center p-4 mb-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <p class="text-red-600 dark:text-red-400">Error loading projects: {data.error.message}</p>
                                </div>
                            </Show>

                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div class="lg:col-start-3 flex justify-end">
                                    <span class="text-xs lowercase italic text-shimmer via-github-entrance">
                                        via github
                                    </span>
                                </div>
                                <For each={data.latest || data()}>
                                    {(project, index) => (
                                        <Card
                                            class="border-2 border-gray-900 dark:border-white rounded-xl text-center hover:scale-105 hover:shadow-lg transition-all duration-300 project-card-entrance"
                                            style={{ "animation-delay": `${index() * 0.05}s` }}>
                                            <CardHeader class="p-5">
                                                <div class="flex items-center justify-between">
                                                    <CardTitle class="text-xl font-semibold">
                                                        <a href={project.html_url} target="_blank" rel="noopener noreferrer"
                                                           class="relative">
                                                            <span class="hover-underline dark:hover-underline-white">
                                                                {project.name.toLowerCase()}
                                                            </span>
                                                        </a>
                                                    </CardTitle>
                                                    <div class="flex items-center space-x-3">
                                                        <Show when={project.stargazers_count > 0}>
                                                            <span class="flex items-center text-sm font-medium">
                                                                <span>{project.stargazers_count}</span>
                                                                <span class="ml-1">★</span>
                                                            </span>
                                                        </Show>
                                                        <Show when={project.homepage}>
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <a href={project.homepage} target="_blank" rel="noopener noreferrer">
                                                                        <RiSystemExternalLinkLine class="h-5 w-5 block transform-gpu transition-all hover:scale-125"/>
                                                                    </a>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{`Clicking this will navigate you to ${project.homepage}`}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </Show>
                                                    </div>
                                                </div>
                                                <Show when={project.language}>
                                                    <div class="mt-2 flex items-center justify-center">
                                                        <span 
                                                            class="inline-block w-3 h-3 rounded-full mr-2"
                                                            style={{"background-color": getLanguageColor(project.language)}}
                                                        />
                                                        <span class="text-sm">
                                                            {project.language}
                                                        </span>
                                                    </div>
                                                </Show>
                                            </CardHeader>
                                            <CardContent class="px-5 pb-5">
                                                <p class="text-sm mb-4">
                                                    <Show when={project.description} fallback="no description">
                                                        {project.description.toLowerCase()}
                                                    </Show>
                                                </p>
                                                <Show when={project.topics && project.topics.length > 0}>
                                                    <div class="flex flex-wrap gap-2 mt-4 justify-center">
                                                        <For each={project.topics}>
                                                            {(topic) => (
                                                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                                                                    {topic}
                                                                </span>
                                                            )}
                                                        </For>
                                                    </div>
                                                </Show>
                                            </CardContent>
                                        </Card>
                                    )}
                                </For>
                            </div>
                        </div>
                    </Suspense>
                </ErrorBoundary>
            </main>
        </>
    );
};

export default Projects;
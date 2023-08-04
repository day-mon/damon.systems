import { createSignal, For, onMount, Show } from "solid-js";
import { Octokit } from "octokit";

interface Error {
    status: number | string;
    message: any;
}

const Projects = () => {
    const [loading, setLoading] = createSignal(true);
    const [projects, setProjects] = createSignal([] as any[]);
    const [error, setError] = createSignal<Error>({} as Error);
    const excluded_repos = [
        "school-bot",
        "ImageSize",
        "silly-zach",
        "Labs",
        "PittJohnstownAPI",
    ];

    const colorMap = new Map([
        ['java', 'orange'],
        ['kotlin', 'rebeccapurple'],
        ['javascript', 'yellow'],
        ['typescript', 'blue'],
        ['python', 'green'],
        ['csharp', 'red'],
        ['go', 'blue'],
        ['ruby', 'red'],
        ['php', 'purple'],
        ['html', 'orange'],
        ['css', 'blue'],
        ['shell', 'green'],
        ['rust', 'orange'],
        ['scala', 'red'],
        ['swift', 'orange'],
        ['c', 'blue'],
        ['c++', 'blue'],
        ['typescript', 'rgb(49, 120, 198)'],
        ['viml', 'blue'],
        ['assembly', 'blue'],
        ['batchfile', 'blue'],
        ['c', 'blue'],
        ['c++', 'blue'],
        ['c#', 'rgb(23, 134, 0)'],
        ['svelte', 'red']
    ])

    console.log(colorMap)

    const octokit = new Octokit();

    const getProjects = async () => {
        if (sessionStorage.getItem("projects")) {
            setProjects(JSON.parse(sessionStorage.getItem("projects") as string));
            setLoading(false);
            setError({} as Error);
            return;
        }

        setLoading(true);
        let request;

        try {
            request = await octokit.request("GET /users/{username}/repos", {
                username: "day-mon",
                type: "owner",
                sort: "updated",
            });
        } catch (e) {
            setError({ status: "Unknown", message: "An unexpected error has occurred" });
            setLoading(false);
            return;
        }

        if (request.status !== 200) {
            setError({ status: request.status, message: request.data });
            setLoading(false);
            return;
        }

        const repoData = request.data
            .filter((repo) => !repo.private)
            .filter((repo) => !repo.fork)
            .filter((repo) => !excluded_repos.includes(repo.name));
        setProjects(repoData);
        sessionStorage.setItem("projects", JSON.stringify(repoData));
        setLoading(false);
        setError({} as Error);
    };

    onMount(async () => {
        await getProjects();
    });

    return (
        <main class="flex justify-center items-center flex-col mb-4 text-center px-4 sm:px-0 space-y-6 animate-fade-in">
            <Show when={loading()}>
                <div class="flex flex-col items-center justify-center space-y-4">
                    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                    <p class="animate-pulse text-lg bg-gray-200 text-transparent bg-clip-text">Loading...</p>
                </div>
            </Show>
            <Show when={error().message}>
                <div class="flex flex-col items-center justify-center space-y-4">
                    <h1 class="text-6xl font-bold text-red-500">Error</h1>
                    <p class="text-red-500">{error().message}</p>
                </div>
            </Show>
            <Show when={!loading() && !error().message}>
                <div class="overflow-auto max-h-[85vh]">
                    <h1 class="text-2xl italic text-center mb-2 font-bold">
                        here are some of the things I have worked on
                    </h1>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-8">
            <span
                class="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 text-2xl text-end hover:cursor-pointer"
                onClick={() => {
                    sessionStorage.removeItem("projects");
                    void getProjects();
                }}
            >
              ↻
            </span>
                        <For each={projects()} fallback={<div>Loading...</div>}>
                            {(project) => (
                                <div
                                    class="border-2 border-gray-900 dark:border-white rounded-lg text-center p-4 hover:scale-105 hover:shadow-lg transition-all duration-300 animate-fade-in"
                                >
                                    <a href={project.html_url} target={"_blank"} class="text-lg text-center font-bold relative">
                    <span class="hover-underline dark:hover-underline-white">
                      {project.name.toLowerCase()}
                    </span>
                                    </a>
                                    <p class="text-center">
                                        {project.description && project.description.toLowerCase() || "no description"}
                                    </p>
                                    <p>{`${project.topics.join(", ")}`}</p>
                                    <p class="text-center text-sm">{`Last updated ${new Date(
                                        project.updated_at
                                    ).toLocaleDateString()}`}</p>
                                    <p class={'text-base'}>Built using <span class={`text-${colorMap.get(project.language.toLowerCase())}-500`}>{project.language.toLowerCase() || "no language"}</span></p>
                                </div>
                            )}
                        </For>
                    </div>
                </div>
            </Show>
        </main>
    );
};

export default Projects;
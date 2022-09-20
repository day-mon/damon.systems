<script lang="ts">
    import {Octokit} from "octokit";

    const colorMap = new Map([
        ['java', 'orange'],
        ['kotlin', 'rebeccapurple'],
        ['javascript', 'yellow'],
        ['python', 'green'],
        ['csharp', 'red'],
        ['go', 'blueviolet'],
        ['ruby', 'red'],
        ['php', 'purple'],
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

    const excluded = ['docker', 'Labs', 'Party-Inviter', 'SteamURLChecker', 'PittJohnstownAPI', 'personal_website']

    const octokit = new Octokit({});

    const fetchData = async () => {

        const {data} = await octokit.request('GET /users/{username}/repos', {
            username: 'day-mon',
        })
        const info = data
            .filter(repo => !repo.private)
            .filter(repo => !repo.fork)
            .filter(repo => excluded.indexOf(repo.name) === -1)
            .sort((a, b) => a.description == null ? 1 : b.description == null ? -1 : a.description.localeCompare(b.description))
            .sort((a, b) => a.name == 'Schoolbot-kt' ? -1 : 1)

        return info
    };


</script>




{#await fetchData()}
    <h1 class="loading">Loading...</h1>
{:then data}
    <h1>Things I worked on.</h1>
    {#each data as repo}
        <!-- show each repo with info in a purple card in a list -->
        <div class="card">
            <div class="card-body">
                <h3 class="card-title">{repo.name.replaceAll("_", " ").toLowerCase()}</h3>
                <h4>{repo.description == null ? '' : repo.description.toLowerCase()}</h4>

                <div id="languages">
                    <p>built using</p>
                    <p style="color: {repo.language == null ? 'black' : colorMap.get(repo.language.toLowerCase())}">{repo.language == null ? 'unknown' : repo.language.toLowerCase()}</p>
                </div>
                {#if repo.topics}
                    <div class="topics">
                        {#each repo.topics as topic}
                            <p class="topic">{topic} </p>
                        {/each}
                    </div>
                {/if}
                <a href={repo.html_url} target="_blank" class="card-link">View on GitHub</a>

            </div>
        </div>
    {/each}
{:catch error}
        <h1 class="loading">Error while attempting to fetch projects :( </h1>
{/await}


<style>
    /* scroll in animation for the cards */

    /* Nice purple card for repos */
    .card {
        border: rebeccapurple 5px solid;
        color: white;
        padding: 10px;
        border-radius: 10px;
        margin-left: auto;
        margin-right: auto;
        margin-bottom: 20px;
        width: 35%;
        text-align: center;
    }

    /** put all text in languages div on one line with space */
    #languages {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        gap: 5px;
    }

    .topics {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        align-content: center;
    }

    .topic {
        margin-left: 5px;
        font-weight: bold;
    }

    /* Loading text  with a nice animation */
    .loading {
        text-align: center;
        left: 50%;
        top: 50%;
        position: absolute;
        transform: translate(-50%, -50%);
    }

    .card-link {
        color: rebeccapurple;
        font-weight: bold;
    }

    .card-link:visited {
        color: #540f8d;
    }

    h1 {
        text-align: center;
    }

    /* make cards look wider on mobile */
    @media only screen and (max-width: 600px) {
        .card {
            width: 120%;
        }
    }

</style>
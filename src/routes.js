import Home from './routes/Home.svelte';
import NotFound from './routes/NotFound.svelte';
import Projects from "./routes/Projects.svelte";

export default  {
    '/': Home,
    '/projects': Projects,
    '*': NotFound,
}

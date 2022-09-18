import Home from './routes/Home.svelte';
import NotFound from './routes/NotFound.svelte';
import Projects from "./routes/Projects.svelte";
import Contact from "./routes/Contact.svelte";
import About from "./routes/About.svelte";


let routes;
export default routes = new Map()
routes.set('/', Home)
routes.set('/projects', Projects)
routes.set('/contact', Contact)
routes.set('/about', About)
routes.set('*', NotFound)



// export default  {
//     '/': Home,
//     '/projects': Projects,
//     '/contact': Contact,
//     '/about': About,
//     '*': NotFound,
// }

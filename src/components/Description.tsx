import {For} from "solid-js";

interface DescriptionProps {
    description: string
    highlightedWords: string[]
    fontSize?: string
}

const Description = (props: DescriptionProps) => (
    <div class="mb-2">
        <For each={props.description.split(" ")}>
            {(word, _) =>
                <span class={`${props.fontSize ? props.fontSize : 'text-2xl sm:text-base md:text-lg lg:text-xl'} ${props.highlightedWords.includes(word.replace(",", "")) ? "font-bold italic" : ""}`}>{word} </span>
            }
        </For>
    </div>
)

export default Description
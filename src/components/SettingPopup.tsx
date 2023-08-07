import {Accessor, Component, Setter} from "solid-js";
import {IFont, ITheme} from "~/constants";
import {TbPaint} from "solid-icons/tb";
import {BsGear, BsPencil} from "solid-icons/bs";

interface SettingsProps {
    themes: ITheme[];
    fonts: IFont[];
    theme: Accessor<string>;
    setTheme: Setter<string>
    onButtonClick: () => void;
    font: Accessor<string>;
    setFont: Setter<string>;
    settingsOpen: Accessor<boolean>;
}

const Settings: Component<SettingsProps> = (props) => {

    return (
        <div class="relative">
            <button
                class="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none"
                onClick={() => props.onButtonClick()}
            >
                <BsGear class="w-6 h-6"/>
            </button>
            <div
                class={`absolute right-0 mt-2 fade-in py-2 w-48 bg-white dark:bg-gray-800 anim rounded-md shadow-lg ${
                    props.settingsOpen() ? "block" : "hidden"
                }`}
            >
                <div class="px-4 py-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        <TbPaint class="inline-block w-6 h-6 mr-2"/> Theme
                    </label>
                    <select
                        value={props.theme()}
                        onChange={(e) => {
                            props.setTheme(e.target.value)
                            props.onButtonClick()
                        }}
                        class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >

                        {props.themes.map((themeOption) => (
                            <option value={themeOption.name}>{themeOption.displayName}</option>
                        ))}
                    </select>
                </div>
                <div class="px-4 py-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        <BsPencil class="inline-block w-6 h-6 mr-2"/> Font
                    </label>
                    <select
                        value={props.font()}
                        onChange={(e) => {
                            props.setFont(e.target.value)
                            props.onButtonClick()
                        }}
                        class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        {props.fonts.map((fontOption) => (
                            <option value={fontOption.name}>{fontOption.displayName}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default Settings;
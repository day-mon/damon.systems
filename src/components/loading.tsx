const Loading = () => (
    <div class="flex flex-col items-center justify-center space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        <p class="animate-pulse text-lg bg-gray-200 text-black dark:text-white bg-clip-text">loading...</p>
    </div>
)

export default Loading
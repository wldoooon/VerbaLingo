import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import "./style.css"

const storage = new Storage({
    area: "local"
})

function SidePanel() {
    const [targetWord] = useStorage<string>({
        key: "target_word",
        instance: storage
    }, "")

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
            <div className="flex items-center gap-2 mb-6">
                <h1 className="text-xl font-bold text-teal-400">VerbaLingo</h1>
                <span className="bg-teal-900 text-teal-200 text-xs px-2 py-1 rounded">DEV</span>
            </div>

            <div className="flex-1 w-full flex flex-col items-center justify-start space-y-4">
                <div className="w-full text-center mb-4">
                    <p className="text-gray-400 text-sm mb-2">Detected Word:</p>
                    <div className="text-2xl font-bold text-teal-300 break-words">
                        {targetWord || "Waiting for selection..."}
                    </div>
                </div>

                <input
                    type="text"
                    placeholder="Search manually..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-teal-500 transition-colors"
                    defaultValue={targetWord}
                />

                <button className="w-full bg-teal-500 hover:bg-teal-400 text-black font-bold py-2 rounded-lg transition-all">
                    Find Video Context
                </button>
            </div>
        </div>
    )
}

export default SidePanel

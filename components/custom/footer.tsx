export default function footer  () {
    return (
        <footer className="bg-white border-t border-gray-200 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 py-4 text-sm text-gray-500">
              © {new Date().getFullYear()} IOM - Global Payment Platform
            </div>
          </footer>
    )
}
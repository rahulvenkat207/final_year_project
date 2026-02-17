import "@testing-library/jest-dom";

// Mock lucide-react
jest.mock("lucide-react", () => {
    return {
        Plus: () => "PlusIcon",
        X: () => "XIcon",
        Video: () => "VideoIcon",
        Loader2: () => "Loader2Icon",
        Calendar: () => "CalendarIcon",
        Clock: () => "ClockIcon",
        BrainCircuit: () => "BrainCircuitIcon",
        ChevronRight: () => "ChevronRightIcon",
        Settings: () => "SettingsIcon",
        PlusCircle: () => "PlusCircleIcon",
        TrendingUp: () => "TrendingUpIcon",
        Users: () => "UsersIcon"
    };
});

// Mock ResizeObserver which is often used by UI libraries
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

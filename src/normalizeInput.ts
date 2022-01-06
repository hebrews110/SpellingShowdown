export function normalizeInput(input: string, ignoreCase: boolean) {
    input = input.replace(/\s\s+/g, ' ').trim();
    if(ignoreCase)
        input = input.toLowerCase();
    return input;
}

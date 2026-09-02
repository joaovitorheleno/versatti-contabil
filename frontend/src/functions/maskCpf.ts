export const maskCPF = (value: any) => {
        return value
            .replace(/\D/g, "")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,3})$/, "$1-$2") 
            .slice(0, 14);
    };
import { memo, useEffect } from "react";

export default memo(() => {
    useEffect(() => {
        const city = localStorage.getItem("city");

        if (city && window.Cities[city]) window.location.replace(`/${city}`);
        else window.location.replace("/cities");
    }, []);

    return null;
});

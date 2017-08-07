
declare namespace copydir {
    /**Copy files synchronous */
    function sync(fromPath: string, targetPath: string): void 

    //function async(fromPath: string, targetPath: string, callBack: (err: any) => void): void
}


export = copydir
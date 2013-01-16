exports.clone = clone;

function clone(path){
    path = check(path);
    var info = getInfo(path);
    handleDir(info[0], info[1]);
}

/**
 * 对传入的地址进行初步的检查和必要的转换
 * 如无法识别，则抛错
 */
function check(path){
    // git ssh -> git read-only
    if(/^git@.+\.git$/.test(path)){
        path = path.replace(':', '/');
        path = path.replace('@','://');
        console.log('transfer ssh path to: ' + path);
        return path;
    }else{
        throw new Error('cannot recognize path: ' + path);
    }
}

/**
 * 获取仓库地址中的 host 和 subDirs 信息
 */
function getInfo(path){
    // git read-only
    if(/^git:\/\/.+\.git$/.test(path)){
        var rt = /^git:\/\/([^/]+)\/(.+)\.git$/.exec(path);
        var host = rt[1];
        var subDirs = rt[2].split('/');
        subDirs.pop();
        console.log('grab path info: ');
        console.log('host: ' + host);
        console.log('subDirs: ' + subDirs);
        return [host, subDirs];
    }
}

function handleDir(host, subDirs){
    
}


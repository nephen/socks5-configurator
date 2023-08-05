document.querySelector('#ing').style.display='none';

// if(navigator.language.toLowerCase().startsWith("zh-")){
//     document.querySelector('#brook').style.display = 'none';
//     document.querySelector('#shiliew').style.display = 'none';
// }else{
//     document.querySelector('#brookzh').style.display = 'none';
//     document.querySelector('#shiliewzh').style.display = 'none';
// }

chrome.storage.local.get('socks5switch', s => {
    s = s.socks5switch || 'on';
    if(s == "on"){
        document.querySelector('#socks5switch').checked = true;
    }
    if(s == "off"){
        document.querySelector('#socks5switch').checked = false;
    }
});
chrome.storage.local.get('socks5server', s => {
    s = s.socks5server || '';
    document.querySelector('#socks5server').value = s;
});
chrome.storage.local.get('socks5token', s => {
    s = s.socks5token || '';
    document.querySelector('#socks5token').value = s;
});
chrome.storage.local.get('bypassswitch', s =>{
    s = s.bypassswitch || 'on';
    if(s == "on"){
        document.querySelector('#bypassswitch').checked = true;
    }
    if(s == "off"){
        document.querySelector('#bypassswitch').checked = false;
    }
});
chrome.storage.local.get('bypassdomainurl', s =>{
    s = s.bypassdomainurl || 'https://txthinking.github.io/bypass/china_domain.txt';
    document.querySelector('#bypassdomainurl').value = s;
});
chrome.storage.local.get('bypasscidr4url', s =>{
    s = s.bypasscidr4url || 'https://txthinking.github.io/bypass/china_cidr4.txt';
    document.querySelector('#bypasscidr4url').value = s;
});
chrome.storage.local.get('bypasscidr6url', s =>{
    s = s.bypasscidr6url || 'https://txthinking.github.io/bypass/china_cidr6.txt';
    document.querySelector('#bypasscidr6url').value = s;
});
chrome.storage.local.get('bypassdomaintxt', s =>{
    s = s.bypassdomaintxt || '';
    document.querySelector('#bypassdomaintxt').value = s;
});

function initRemoteIp() {
    setTimeout(()=>{
        // 1. 创建XMLHttpRequest对象
        var xhr = new XMLHttpRequest();

        // 2. 配置请求
        xhr.open('GET', "http://"+document.querySelector('#socks5server').value);

        // 3. 设置请求头
        xhr.setRequestHeader('Add_remote_ip', document.querySelector('#socks5token').value);

        // 4. 监听请求完成事件
        xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
            // 5. 请求成功处理
            var response = xhr.responseText;
            console.log('服务器返回的数据：', response);
            } else {
            // 6. 请求失败处理
            console.error('请求失败：', xhr.status, xhr.statusText);
            }
        }
        };

        // 7. 发送请求
        xhr.send();
    }, 3000);
}

initRemoteIp();

document.querySelector('#save').addEventListener("click", async (e) => {
    document.querySelector('#save').style.display = 'none';
    document.querySelector('#ing').style.display = 'block';

    var socks5switch = document.querySelector('#socks5switch').checked;
    var socks5server = document.querySelector('#socks5server').value;
    var socks5token = document.querySelector('#socks5token').value;
    var bypassswitch = document.querySelector('#bypassswitch').checked;
    var bypassdomainurl = document.querySelector('#bypassdomainurl').value;
    var bypasscidr4url = document.querySelector('#bypasscidr4url').value;
    var bypasscidr6url = document.querySelector('#bypasscidr6url').value;
    var bypassdomaintxt = document.querySelector('#bypassdomaintxt').value;

    if(socks5switch){
        if(!/.+:\d+/.test(socks5server)){
            alert("Invalid socks5 proxy address");
            document.querySelector('#save').style.display = 'block';
            document.querySelector('#ing').style.display = 'none';
            return;
        }
    }
    chrome.storage.local.set({"socks5switch": socks5switch ? 'on' : 'off'});
    chrome.storage.local.set({"socks5server": socks5server});
    chrome.storage.local.set({"socks5token": socks5token});
    var l = [
		"10.0.0.0/8",
		"127.0.0.0/8",
		"169.254.0.0/16",
		"172.16.0.0/12",
		"192.168.0.0/16",
		"224.0.0.0/4",
        "<local>",
        "<localhost>",
        "*.local",
	];
    if(bypassswitch){
        try{
            var r = await fetch(bypassdomainurl);
            if(r.status != 200){
                throw Error(`When fetch bypass list: ${r.status}`);
            }
            var s = await r.text();
            var l1 = s.trim().split('\n');
            l1.forEach(v=>{
                l.push(v.trim());
                l.push("*."+v.trim());
            });
            var r = await fetch(bypasscidr4url);
            if(r.status != 200){
                throw Error(`When fetch bypass list: ${r.status}`);
            }
            var s = await r.text();
            var l1 = s.trim().split('\n');
            l1.forEach(v=>{
                l.push(v.trim());
            });
            var r = await fetch(bypasscidr6url);
            if(r.status != 200){
                throw Error(`When fetch bypass list: ${r.status}`);
            }
            var s = await r.text();
            var l1 = s.trim().split('\n');
            l1.forEach(v=>{
                l.push(v.trim());
            });
            var r = await fetch(bypasscidr6url);
            if(r.status != 200){
                throw Error(`When fetch bypass list: ${r.status}`);
            }
            var l1 = bypassdomaintxt.trim().split(';');
            l1.forEach(v=>{
                l.push(v.trim());
            });
        }catch(e){
            alert(`When fetch bypass list: ${e.message}`);
            document.querySelector('#save').style.display = 'block';
            document.querySelector('#ing').style.display = 'none';
            return;
        }
    }
    chrome.storage.local.set({"bypassswitch": bypassswitch ? 'on' : 'off'});
    chrome.storage.local.set({"bypassdomainurl": bypassdomainurl});
    chrome.storage.local.set({"bypasscidr4url": bypasscidr4url});
    chrome.storage.local.set({"bypasscidr6url": bypasscidr6url});
    chrome.storage.local.set({"bypassdomaintxt": bypassdomaintxt});

    if(!socks5switch){
        chrome.proxy.settings.set({
            value: {
                mode: "system",
            },
        },()=>{
            setTimeout(()=>{
                document.querySelector('#save').style.display = 'block';
                document.querySelector('#ing').style.display = 'none';
            }, 2000);
        });
        return;
    }

    var host = socks5server.substring(0, socks5server.lastIndexOf(':')).replace('[', '').replace(']', '');
    var port = socks5server.substring(socks5server.lastIndexOf(':')+1);
    l.push(host);
    chrome.proxy.settings.set({
        value: {
            mode: "fixed_servers",
            rules: {
                singleProxy: {
                    scheme: "socks5",
                    host: host,
                    port: parseInt(port),
                },
                bypassList: l,
            },
        },
    },()=>{
        setTimeout(()=>{
            document.querySelector('#save').style.display = 'block';
            document.querySelector('#ing').style.display = 'none';
            initRemoteIp();
        }, 1000);
    });
});
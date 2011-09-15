require 'webrick'
require 'net/http'

$privatekey = "private api key"

srv = WEBrick::HTTPServer.new({ :DocumentRoot => './',
                                :BindAddress => '127.0.0.1',
                                :Port => 8080})
srv.mount_proc('/verify'){|req, res|
  res["content-type"] = "text/plain"

  uri = URI.parse("http://www.google.com/recaptcha/api/verify")
  postdata = {'privatekey' => $privatekey, 'remoteip' => req.peeraddr[-1],
    'challenge' => req.query['recaptcha_challenge_field'],
    'response' => req.query['recaptcha_response_field']}
  res.body = Net::HTTP.start(uri.host, uri.port){|h|
    h.post(uri.path, URI.encode_www_form(postdata)).body
  }
}
srv.mount('/index.html', WEBrick::HTTPServlet::FileHandler, 'index.html')
srv.mount('/jquery_form.js', WEBrick::HTTPServlet::FileHandler, 'jquery.form.js')
srv.mount('/captchagame.js', WEBrick::HTTPServlet::FileHandler, 'captchagame.js')
trap("INT"){ srv.shutdown }
srv.start

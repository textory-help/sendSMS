#!/usr/bin/env ruby
# Send an SMS via paired phone (global).
#   TEXTORY_API_KEY=sk_live_... ruby send_phone.rb

require 'json'
require 'net/http'
require 'securerandom'
require 'uri'

api_key = ENV['TEXTORY_API_KEY']
abort 'export TEXTORY_API_KEY=sk_live_...' if api_key.nil? || api_key.empty?

uri = URI('https://openapi.textory.io/openapi/v1/messages/phone')
req = Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json',
                               'Authorization' => "Bearer #{api_key}")
req.body = {
  clientId: SecureRandom.uuid,
  contents: 'Hi {{name}}, your verification code is 917043.',
  recipients: [{ phoneNumber: '+14155551234', name: 'Alice' }]
}.to_json

resp = Net::HTTP.start(uri.host, uri.port, use_ssl: true, read_timeout: 30) { |http| http.request(req) }

if resp.code.to_i >= 400 && resp.code.to_i != 409
  warn "❌ HTTP #{resp.code}\n#{resp.body}"
  exit 1
end

puts "✅ #{resp.body}"

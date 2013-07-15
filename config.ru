#\ -s puma
# $LOAD_PATH.unshift(File.dirname(__FILE__))

require 'bundler/setup'
require './live_scheduler'

run LiveScheduler

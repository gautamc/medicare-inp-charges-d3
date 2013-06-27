#!/usr/bin/env ruby
require 'rubygems'
require 'active_record'
require 'logger'

ActiveRecord::Base.logger = nil #Logger.new(STDOUT)
ActiveRecord::Base.establish_connection(
  :adapter => "mysql2",
  :host => "localhost",
  :username => "root",
  :password => "",
  :database => "medicare"
)

class Drg < ActiveRecord::Base
  has_many :inp_charges
  attr_accessible(:name, :md5hash)
end

class Provider < ActiveRecord::Base
  has_many :inp_charges
  attr_accessible(
    :id_from_medicare, :name, :street_address, :city, :state, :zip_code, :md5hash
  )
end

class InpCharge < ActiveRecord::Base
  belongs_to :provider
  belongs_to :drg
  attr_accessible(
    :drg, :provider, :hospital_referral_region, :total_discharges,
    :average_covered_charges, :average_total_payments
  )
end


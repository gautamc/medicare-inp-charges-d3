#!/usr/bin/env ruby
require 'rubygems'
require 'csv'
require 'active_record'
require 'logger'
require 'digest'

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

i=0
CSV.foreach("./csv/Medicare_Provider_Charge_Inpatient_DRG100_FY2011.csv") do
  |fields|
  
  if i == 0
    i = 1
    next
  end

  # DRG Definition - 0 |
  # Provider Id - 1 | Provider Name - 2 | Provider Street Address - 3
  # Provider City - 4 | Provider State - 5 | Provider Zip Code - 6 |
  # Hospital Referral Region Description - 7 |
  # Total Discharges - 8 | Average Covered Charges - 9 | Average Total Payments - 10

  drg_obj = Drg.where(["md5hash = ?", Digest::MD5.hexdigest(fields[0])]).first
  if drg_obj.nil?
    drg_obj = Drg.create!(
      name: fields[0], md5hash: Digest::MD5.hexdigest(fields[0])
    )
  end

  for_md5hash = fields[1] + fields[2] + fields[3] + fields[4] + fields[5] + fields[6]
  provider_obj = Provider.where(["md5hash = ?", Digest::MD5.hexdigest(for_md5hash)]).first
  if provider_obj.nil?
    provider_obj = Provider.create!(
      id_from_medicare: fields[1],
      name: fields[2], street_address: fields[3], city: fields[4],
      state: fields[5], zip_code: fields[6], md5hash: Digest::MD5.hexdigest(for_md5hash)
    )
  end

  inp_charge_obj = InpCharge.create!(
    drg: drg_obj, provider: provider_obj, hospital_referral_region: fields[7],
    total_discharges: fields[8], average_covered_charges: fields[9],
    average_total_payments: fields[10]
  )
  i = i + 1
end

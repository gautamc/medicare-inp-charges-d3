#!/usr/bin/env ruby
require 'rubygems'
require 'active_record'
require 'logger'

ActiveRecord::Base.logger = Logger.new(STDOUT)
ActiveRecord::Base.establish_connection(
  :adapter => "mysql2",
  :host => "localhost",
  :username => "root",
  :password => "",
  :database => "medicare"
)

class CreateDRGs < ActiveRecord::Migration
  def self.up
    create_table :drgs do |t|
      t.column :name, :string
      t.column :md5hash, :string
    end
    add_index :drgs, :name, :unique => true
    add_index :drgs, :md5hash, :unique => true
  end
  
  def self.down
    drop_table :drgs
  end
end

#CreateDRGs.up

class CreateProviders < ActiveRecord::Migration
  def self.up
    create_table :providers do |t|
      t.column :id_from_medicare, :string
      t.column :name, :string
      t.column :street_address, :string
      t.column :city, :string
      t.column :state, :string
      t.column :zip_code, :string
      t.column :md5hash, :string
    end
    add_index :providers, :md5hash, :unique => true
  end

  def self.down
    drop_table :providers
  end
end

#CreateProviders.up

class CreateInpCharges < ActiveRecord::Migration
  def self.up
    create_table :inp_charges do |t|
      t.references :drg
      t.references :provider
      t.column :hospital_referral_region, :string
      t.column :total_discharges, :integer
      t.column :average_covered_charges, :double
      t.column :average_total_payments, :double
    end
    add_index :inp_charges, :drg_id, :unique => false
    add_index :inp_charges, :provider_id, :unique => false
  end

  def self.down
    drop_table :inp_charges
  end
end

CreateInpCharges.up

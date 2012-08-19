# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant::Config.run do |config|

  config.vm.host_name = "dev.hozedpersona.me"
  config.vm.box = "hostedpersona1"
  config.vm.box_url = "http://dl.dropbox.com/u/7490647/talifun-ubuntu-11.04-server-i386.box"

  config.vm.boot_mode = :gui

  # config.vm.network :hostonly, "192.168.33.10"

  config.vm.forward_port 3000, 3000

  #config.vm.provision :puppet do |puppet|
  #  puppet.manifests_path = "puppet/manifests"
  #  puppet.manifest_file  = "hostedpersona.pp"
  #end
  # TODO puppetify daemontools

end
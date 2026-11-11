-- 005: Site Doctor's public schedule label says what GitHub's scheduler actually delivers (ADR-0017).
-- SP3: scheduled runs start about once in 6 hourly slots, so "About hourly" overstated it.
update lab.agents set schedule_label = 'Several times a day' where id = 'site-doctor';
